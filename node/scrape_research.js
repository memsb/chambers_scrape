import _, { map } from 'underscore';
import {
  get_all_research_for_guide,
  get_research_for_guide,
  get_research_details,
  get_researching_guides
} from "./lib/chambers_api.mjs";
import {
  get_researching_publication,
  add_researching_publication,
  set_publication_research_complete,
  add_research,
  get_research,
  get_research_publications
} from "./lib/dynamo.mjs";
import { render_research_page, render_index } from "./lib/render_research.mjs";
import { upload } from "./lib/s3.mjs";

const scrape_detailed_research_for_guide = async (guide_id) => {
  const items = await get_all_research_for_guide(guide_id);

  return await Promise.all(
    items.map(async (item) => {
      const details = await get_research_details(item.id);
      return {...item, ...details};
    })
  );
};

const scrape_research_for_guide = async (publication) => {
  const items = await scrape_detailed_research_for_guide(publication.id);

  for (let research of items){
    let db_item = await get_research(research.id);
    if (db_item) {
      const updated_item = {...db_item, ...research};
      const is_updated = _.isEqual(db_item, updated_item);
      if (is_updated) {
        await add_research(updated_item);
      }
    } else {
      // add to DB
      await add_research(research);
    }
  }

  const is_research_completed = items.every((research) => research.status === "Section Completed");
  if (is_research_completed) {
    set_publication_research_complete(publication);
  }
};

const create_new_researching_publication = async (guide_id, guideType, guideYear) => {
  let publication = {
    id: guide_id,
    guideType: guideType,
    guideYear: guideYear,
    research_complete: false
  };
  console.log('New researching publication', publication);
  await add_researching_publication(publication);

  return publication;
}

const get_currently_researching_publication = async (guide_id) => {
  const result = await get_research_for_guide(guide_id);
  const first_item = result.data[0];

  return await get_researching_publication(guide_id, first_item.guideYear);
}

const run = async () => {
  const guides = await get_researching_guides();

  for (const guide of guides) {
    let publication = await get_currently_researching_publication(guide.id);

    if (!publication) {
      publication = await create_new_researching_publication(guide_id, first_item.guideType, first_item.guideYear);
      const index = await render_index();
      await upload('research/index.html', index);
    }

    if (!publication.research_complete) {
        const publication_name = `${publication.guideType} ${publication.guideYear}`;
        console.log(`Updating schedule for ${publication_name}`);
        console.time(publication_name);

        await scrape_research_for_guide(publication);

        const page = await render_research_page(publication);
        await upload(`research/${publication_name}.html`, page);

        console.timeEnd(publication_name);
    }
  }
};

run();
  