import { json } from "@remix-run/server-runtime";
import type { ActionFunctionArgs } from "@remix-run/server-runtime";
import { getPagesCollection, getToursCollection } from "~/utils/db.server";
import { ObjectId } from "mongodb";
import { processContent, translateContent, translateText, logContentSize } from "~/utils/page.server";
import type { Page, Tour } from "~/utils/db.schema.server";
import type { Filter } from "mongodb";

// In-memory store for background jobs
// In a production environment, this should be replaced with a proper job queue system
const backgroundJobs = new Map<string, {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  message: string;
  error?: string;
  startTime: Date;
}>();

// Function to process page update in the background
async function processPageUpdateInBackground(
  id: string,
  name: string,
  content: Record<string, unknown>,
  status: 'active' | 'upcoming'
) {
  const jobId = `update-${id}-${Date.now()}`;
  
  // Create a job entry
  backgroundJobs.set(jobId, {
    status: 'pending',
    message: 'Job queued',
    startTime: new Date()
  });
  
  // Process the job asynchronously
  setTimeout(async () => {
    try {
      // Update job status
      backgroundJobs.set(jobId, {
        ...backgroundJobs.get(jobId)!,
        status: 'processing',
        message: 'Processing Spanish content'
      });
      
      // Process the Spanish content (optimize images, no translation)
      console.log("Processing Spanish content for update in background...");
      const processedSpanishContent = await processContent(content, false);
      
      // Update job status
      backgroundJobs.set(jobId, {
        ...backgroundJobs.get(jobId)!,
        message: 'Translating content to English'
      });
      
      // Create English content by translating the processed Spanish content
      console.log("Translating content to English in background...");
      const englishContent = await translateContent({ ...processedSpanishContent });
      
      // Get the pages collection
      const pagesCollection = await getPagesCollection();
      const toursCollection = await getToursCollection();
      
      // Create a properly typed filter
      const objectId = new ObjectId(id);
      const filter: Filter<Page> = { _id: objectId as unknown as string };
      
      // Find the existing page
      const existingPage = await pagesCollection.findOne(filter);
      
      if (!existingPage) {
        throw new Error("Page not found");
      }
      
      // Update job status
      backgroundJobs.set(jobId, {
        ...backgroundJobs.get(jobId)!,
        message: 'Updating tour information'
      });
      
      // Determine if this is a tour page based on price
      let template = existingPage.template || "";
      
      if (content.price && typeof content.price === "number" && content.price > 0) {
        template = "tour";
        console.log(`Updating page "${name}" as a tour with price ${content.price}€`);
        
        // Translate the tour name
        let translatedTourName = name;
        try {
          // Special handling for tour names
          if (name.toLowerCase().startsWith("tour de ")) {
            const subject = name.substring(8); // Get everything after "Tour de "
            console.log(`Detected 'Tour de X' pattern. Subject to translate: "${subject}"`);
            
            // Translate just the subject
            const translatedSubject = await translateText(subject);
            console.log(`Translated subject: "${translatedSubject}"`);
            
            // Format as "X Tour" in English
            translatedTourName = `${translatedSubject} Tour`;
            console.log(`Formatted as English tour name: "${translatedTourName}"`);
          } else {
            // For other tour names, translate the whole thing
            translatedTourName = await translateText(name);
            console.log(`Translated tour name: "${translatedTourName}"`);
          }
        } catch (error) {
          console.error('Error translating tour name:', error);
          translatedTourName = name; // Fallback to Spanish title if translation fails
        }
        
        // Clean up the translated name - remove any quotation marks that might have been added
        translatedTourName = translatedTourName.replace(/^["']|["']$/g, '').replace(/\\"/g, '');
        
        console.log(`Final tour titles - ES: "${name}", EN: "${translatedTourName}"`);
        
        // Check if a tour already exists for this page
        const pageIdString = id.toString();
        const existingTour = await toursCollection.findOne({ pageId: pageIdString });
        
        if (existingTour) {
          // Update the existing tour
          try {
            await toursCollection.updateOne(
              { pageId: pageIdString },
              {
                $set: {
                  tourName: {
                    es: name,
                    en: translatedTourName
                  },
                  tourPrice: content.price,
                  status: status,
                  description: {
                    es: String((processedSpanishContent.section1 as Record<string, unknown>)?.title || ""),
                    en: String((englishContent.section1 as Record<string, unknown>)?.title || "")
                  },
                  duration: {
                    es: String((processedSpanishContent.section4 as Record<string, unknown>)?.duration || ""),
                    en: String((englishContent.section4 as Record<string, unknown>)?.duration || "")
                  },
                  includes: {
                    es: String((processedSpanishContent.section4 as Record<string, unknown>)?.includes || ""),
                    en: String((englishContent.section4 as Record<string, unknown>)?.includes || "")
                  },
                  meetingPoint: {
                    es: String((processedSpanishContent.section4 as Record<string, unknown>)?.meetingPoint || ""),
                    en: String((englishContent.section4 as Record<string, unknown>)?.meetingPoint || "")
                  },
                  updatedAt: new Date()
                }
              }
            );
            console.log(`Updated tour for page "${name}" with price ${content.price}€`);
          } catch (tourUpdateError) {
            console.error("Error updating tour:", tourUpdateError);
            // Continue with page update even if tour update fails
          }
        } else {
          // Create a new tour
          try {
            const newTour: Omit<Tour, "_id"> = {
              slug: existingPage.slug,
              tourName: {
                es: name,
                en: translatedTourName
              },
              tourPrice: content.price,
              status: status,
              description: {
                es: String((processedSpanishContent.section1 as Record<string, unknown>)?.title || ""),
                en: String((englishContent.section1 as Record<string, unknown>)?.title || "")
              },
              duration: {
                es: String((processedSpanishContent.section4 as Record<string, unknown>)?.duration || ""),
                en: String((englishContent.section4 as Record<string, unknown>)?.duration || "")
              },
              includes: {
                es: String((processedSpanishContent.section4 as Record<string, unknown>)?.includes || ""),
                en: String((englishContent.section4 as Record<string, unknown>)?.includes || "")
              },
              meetingPoint: {
                es: String((processedSpanishContent.section4 as Record<string, unknown>)?.meetingPoint || ""),
                en: String((englishContent.section4 as Record<string, unknown>)?.meetingPoint || "")
              },
              pageId: pageIdString,
              createdAt: new Date(),
              updatedAt: new Date()
            };
            
            await toursCollection.insertOne(newTour);
            console.log(`Created new tour for page "${name}" with price ${content.price}€`);
            console.log(`Tour name set - ES: "${name}", EN: "${translatedTourName}"`);
          } catch (tourCreateError) {
            console.error("Error creating tour:", tourCreateError);
            // Continue with page update even if tour creation fails
          }
        }
      }
      
      // Update job status
      backgroundJobs.set(jobId, {
        ...backgroundJobs.get(jobId)!,
        message: 'Analyzing content size and updating page in database'
      });
      
      // Log content size before updating
      const contentToUpdate = {
        es: processedSpanishContent,
        en: englishContent
      };
      await logContentSize(contentToUpdate, "update");
      
      // Update the page with new Spanish content and translated English content
      const result = await pagesCollection.updateOne(
        filter,
        {
          $set: {
            name,
            status,
            template,
            "content.es": processedSpanishContent,
            "content.en": englishContent,
            updatedAt: new Date()
          }
        }
      );
      
      if (result.matchedCount === 0) {
        throw new Error("Page not found during final update");
      }
      
      // Update job status to completed
      backgroundJobs.set(jobId, {
        ...backgroundJobs.get(jobId)!,
        status: 'completed',
        message: 'Page updated successfully with translations'
      });
      
      console.log(`Background job ${jobId} completed successfully`);
      
      // Clean up old jobs (older than 1 hour)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      for (const [key, job] of backgroundJobs.entries()) {
        if (job.startTime < oneHourAgo) {
          backgroundJobs.delete(key);
        }
      }
    } catch (error) {
      console.error(`Background job ${jobId} failed:`, error);
      
      // Update job status to failed
      backgroundJobs.set(jobId, {
        ...backgroundJobs.get(jobId)!,
        status: 'failed',
        message: 'Job failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }, 0); // Start immediately but asynchronously
  
  return jobId;
}

// Endpoint to check job status
export const loader = async ({ request }: ActionFunctionArgs) => {
  const url = new URL(request.url);
  const jobId = url.searchParams.get('jobId');
  
  if (!jobId) {
    return json({ error: "Job ID is required" }, { status: 400 });
  }
  
  const job = backgroundJobs.get(jobId);
  
  if (!job) {
    return json({ error: "Job not found" }, { status: 404 });
  }
  
  return json({
    jobId,
    status: job.status,
    message: job.message,
    error: job.error
  });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  if (request.method !== "PUT") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  const { id } = params;
  
  if (!id) {
    return json({ error: "Page ID is required" }, { status: 400 });
  }

  try {
    const formData = await request.formData();
    const name = formData.get("name");
    const contentStr = formData.get("content");
    const status = formData.get("status");
    const background = formData.get("background");

    if (!name || typeof name !== "string") {
      return json({ error: "Name is required" }, { status: 400 });
    }

    if (!contentStr || typeof contentStr !== "string") {
      return json({ error: "Content is required" }, { status: 400 });
    }

    if (!status || (status !== "active" && status !== "upcoming")) {
      return json({ error: "Status must be either 'active' or 'upcoming'" }, { status: 400 });
    }

    let content;
    try {
      content = JSON.parse(contentStr);
    } catch (parseError) {
      console.error("Error parsing content JSON:", parseError);
      return json({ error: "Invalid content format: Unable to parse JSON" }, { status: 400 });
    }
    
    // Check if this is a background processing request
    if (background === "true") {
      console.log("Starting background processing for page update:", id);
      
      try {
        // Start background processing and get job ID
        const jobId = await processPageUpdateInBackground(
          id,
          name as string,
          content,
          status as 'active' | 'upcoming'
        );
        
        // Return job ID for status checking
        return json({ 
          success: true, 
          message: "Page update started in background",
          jobId,
          status: "processing"
        });
      } catch (error) {
        console.error("Error starting background job:", error);
        return json({ 
          error: "Failed to start background processing: " + (error instanceof Error ? error.message : "Unknown error") 
        }, { status: 500 });
      }
    }
    
    // If not a background request, continue with synchronous processing
    // Process the Spanish content (optimize images, no translation)
    console.log("Processing Spanish content for update...");
    let processedSpanishContent;
    try {
      processedSpanishContent = await processContent(content, false);
    } catch (processError) {
      console.error("Error processing Spanish content:", processError);
      return json({ 
        error: "Error processing content: " + (processError instanceof Error ? processError.message : "Unknown error") 
      }, { status: 500 });
    }

    // Create English content by translating the processed Spanish content
    console.log("Translating content to English...");
    let englishContent;
    try {
      englishContent = await translateContent({ ...processedSpanishContent });
    } catch (translateError) {
      console.error("Error translating content:", translateError);
      return json({ 
        error: "Error translating content: " + (translateError instanceof Error ? translateError.message : "Unknown error") 
      }, { status: 500 });
    }

    // Get the pages collection
    const pagesCollection = await getPagesCollection();
    const toursCollection = await getToursCollection();
    
    // Create a properly typed filter
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (idError) {
      console.error("Invalid ObjectId format:", idError);
      return json({ error: "Invalid page ID format" }, { status: 400 });
    }
    
    const filter: Filter<Page> = { _id: objectId as unknown as string };
    
    // Find the existing page to get the English content
    const existingPage = await pagesCollection.findOne(filter);
    
    if (!existingPage) {
      return json({ error: "Page not found" }, { status: 404 });
    }

    // Determine if this is a tour page based on price
    let template = existingPage.template || "";
    let tourUpdated = false;
    
    if (content.price && typeof content.price === "number" && content.price > 0) {
      template = "tour";
      console.log(`Updating page "${name}" as a tour with price ${content.price}€`);
      
      // Translate the tour name
      let translatedTourName = name;
      try {
        // Special handling for tour names
        if (name.toLowerCase().startsWith("tour de ")) {
          const subject = name.substring(8); // Get everything after "Tour de "
          console.log(`Detected 'Tour de X' pattern. Subject to translate: "${subject}"`);
          
          // Translate just the subject
          const translatedSubject = await translateText(subject);
          console.log(`Translated subject: "${translatedSubject}"`);
          
          // Format as "X Tour" in English
          translatedTourName = `${translatedSubject} Tour`;
          console.log(`Formatted as English tour name: "${translatedTourName}"`);
        } else {
          // For other tour names, translate the whole thing
          translatedTourName = await translateText(name);
          console.log(`Translated tour name: "${translatedTourName}"`);
        }
        
        // Clean up the translated name - remove any quotation marks that might have been added
        translatedTourName = translatedTourName.replace(/^["']|["']$/g, '').replace(/\\"/g, '');
        console.log(`Final translated tour name: "${translatedTourName}"`);
      } catch (error) {
        console.error('Error translating tour name:', error);
        translatedTourName = name; // Fallback to Spanish name if translation fails
      }
      
      // Update the corresponding tour in the tours collection
      const pageIdString = objectId.toString();
      const tourFilter: Filter<Tour> = { pageId: pageIdString };
      
      // Check if a tour exists for this page
      const existingTour = await toursCollection.findOne(tourFilter);
      
      if (existingTour) {
        // Update the existing tour
        try {
          const tourUpdateResult = await toursCollection.updateOne(
            tourFilter,
            {
              $set: {
                tourName: {
                  es: name,
                  en: translatedTourName
                },
                tourPrice: content.price,
                status: status as 'active' | 'upcoming',
                updatedAt: new Date()
              }
            }
          );
          
          tourUpdated = tourUpdateResult.modifiedCount > 0;
          console.log(`Updated tour for page "${name}" with price ${content.price}€`);
          console.log(`Tour name updated - ES: "${name}", EN: "${translatedTourName}"`);
        } catch (tourUpdateError) {
          console.error("Error updating tour:", tourUpdateError);
          // Continue with page update even if tour update fails
        }
      } else {
        // Create a new tour if it doesn't exist
        try {
          const newTour: Tour = {
            slug: existingPage.slug,
            tourName: {
              es: name,
              en: translatedTourName
            },
            tourPrice: content.price,
            status: status as 'active' | 'upcoming',
            description: {
              es: String((processedSpanishContent.section1 as Record<string, unknown>)?.title || ""),
              en: String((englishContent.section1 as Record<string, unknown>)?.title || "")
            },
            duration: {
              es: String((processedSpanishContent.section4 as Record<string, unknown>)?.duration || ""),
              en: String((englishContent.section4 as Record<string, unknown>)?.duration || "")
            },
            includes: {
              es: String((processedSpanishContent.section4 as Record<string, unknown>)?.includes || ""),
              en: String((englishContent.section4 as Record<string, unknown>)?.includes || "")
            },
            meetingPoint: {
              es: String((processedSpanishContent.section4 as Record<string, unknown>)?.meetingPoint || ""),
              en: String((englishContent.section4 as Record<string, unknown>)?.meetingPoint || "")
            },
            pageId: pageIdString,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          await toursCollection.insertOne(newTour);
          tourUpdated = true;
          console.log(`Created new tour for page "${name}" with price ${content.price}€`);
          console.log(`Tour name set - ES: "${name}", EN: "${translatedTourName}"`);
        } catch (tourCreateError) {
          console.error("Error creating tour:", tourCreateError);
          // Continue with page update even if tour creation fails
        }
      }
    }
    
    // Update the page with new Spanish content and translated English content
    try {
      // Log content size before updating
      const contentToUpdate = {
        es: processedSpanishContent,
        en: englishContent
      };
      console.log("Logging content size before synchronous update...");
      await logContentSize(contentToUpdate, "update");
      
      const result = await pagesCollection.updateOne(
        filter,
        {
          $set: {
            name,
            status,
            template,
            "content.es": processedSpanishContent,
            "content.en": englishContent,
            updatedAt: new Date()
          }
        }
      );
      
      if (result.matchedCount === 0) {
        return json({ error: "Page not found during update" }, { status: 404 });
      }
      
      return json({ 
        success: true, 
        message: "Page updated successfully",
        tourUpdated
      });
    } catch (updateError) {
      console.error("Error updating page:", updateError);
      return json(
        { error: updateError instanceof Error ? updateError.message : "Failed to update page" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error updating page:", error);
    return json(
      { error: error instanceof Error ? error.message : "Failed to update page" },
      { status: 500 }
    );
  }
}; 