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
  
  const pagesCollection = await getPagesCollection();
  const toursCollection = await getToursCollection();
  const objectId = new ObjectId(id);
  const filter: Filter<Page> = { _id: objectId as unknown as string };
  
  // First, get the page to find the tour's slug
  const page = await pagesCollection.findOne(filter);
  
  if (!page) {
    return json({ error: "Page not found" }, { status: 404 });
  }
  
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
  
  // Also update the corresponding tour's minPeople/maxPeople
  // Tours can be found by slug or by pageId
  const tourSlug = page.slug;
  if (tourSlug) {
    await toursCollection.updateOne(
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
  }
  
  // Also try to update by pageId
  const pageIdStr = page._id?.toString();
  if (pageIdStr) {
    await toursCollection.updateOne(
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
  }
  
  return json({ success: true });
};
