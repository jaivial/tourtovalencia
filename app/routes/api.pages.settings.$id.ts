import { json, type ActionFunctionArgs } from "@remix-run/server-runtime";
import { getPagesCollection, getToursCollection } from "~/utils/db.server";
import { ObjectId, type Filter } from "mongodb";
import type { Page, Tour } from "~/utils/db.schema.server";

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { id } = params;
  
  if (!id) {
    return json({ error: "Page ID required" }, { status: 400 });
  }
  
  const formData = await request.formData();
  
  const status = formData.get("status") as string;
  const hasPrice = formData.get("hasPrice") === "true";
  const price = parseFloat(formData.get("price") as string) || 0;
  const minPeople = parseInt(formData.get("minPeople") as string) || 1;
  const maxPeople = parseInt(formData.get("maxPeople") as string) || 10;

  console.log('[API:settings] Updating page:', id, 'with minPeople:', minPeople, 'maxPeople:', maxPeople);
  
  const pagesCollection = await getPagesCollection();
  const toursCollection = await getToursCollection();
  const objectId = new ObjectId(id);
  const filter = { _id: objectId } as unknown as Filter<Page>;
  
  // First, get the page to find the tour's slug
  const page = await pagesCollection.findOne(filter);
  
  if (!page) {
    console.log('[API:settings] Page not found:', id);
    return json({ error: "Page not found" }, { status: 404 });
  }
  
  console.log('[API:settings] Found page:', page.slug, 'pageId:', page._id?.toString());
  
  // Update pages collection
  const result = await pagesCollection.updateOne(
    filter,
    {
      $set: {
        status: status as "active" | "upcoming",
        hasPrice,
        price,
        "content.es.minPeople": minPeople,
        "content.es.maxPeople": maxPeople,
        "content.en.minPeople": minPeople,
        "content.en.maxPeople": maxPeople,
        updatedAt: new Date()
      }
    }
  );
  
  console.log('[API:settings] Pages updated, result:', result.modifiedCount);
  
  // Also update the corresponding tour's minPeople/maxPeople
  // Tours can be found by slug or by pageId
  const tourSlug = page.slug;
  let toursUpdated = 0;
  
  if (tourSlug) {
    const tourResult = await toursCollection.updateOne(
      { slug: tourSlug },
      {
        $set: {
          minPeople,
          maxPeople,
          "content.es.minPeople": minPeople,
          "content.es.maxPeople": maxPeople,
          "content.en.minPeople": minPeople,
          "content.en.maxPeople": maxPeople,
          updatedAt: new Date()
        }
      }
    );
    toursUpdated += tourResult.modifiedCount;
    console.log('[API:settings] Updated tour by slug:', tourSlug, 'result:', tourResult.modifiedCount);
  }
  
  // Also try to update by pageId
  const pageIdStr = page._id?.toString();
  if (pageIdStr) {
    const tourByPageIdResult = await toursCollection.updateOne(
      { pageId: pageIdStr },
      {
        $set: {
          minPeople,
          maxPeople,
          "content.es.minPeople": minPeople,
          "content.es.maxPeople": maxPeople,
          "content.en.minPeople": minPeople,
          "content.en.maxPeople": maxPeople,
          updatedAt: new Date()
        }
      }
    );
    toursUpdated += tourByPageIdResult.modifiedCount;
    console.log('[API:settings] Updated tour by pageId:', pageIdStr, 'result:', tourByPageIdResult.modifiedCount);
  }
  
  console.log('[API:settings] Total tours updated:', toursUpdated);
  
  return json({ success: true, toursUpdated });
};
