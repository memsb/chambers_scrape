import { get_research_publications, get_research_for_publication } from "./dynamo.mjs";
import Handlebars from "handlebars";
import fs from "fs-extra";
import moment from 'moment';

Handlebars.registerHelper('uppercase', (aString) => aString.toUpperCase());
Handlebars.registerHelper('date', (aString) => aString ? moment(aString).format("MMMM Do YYYY") : '')

export const render_research_page = async (publication) => {
  let research = await get_research_for_publication(publication.guideType, publication.guideYear);
  research.sort((a, b) => a.location.localeCompare(b.location) || a.practiceArea.localeCompare(b.practiceArea));

  const contents = fs.readFileSync("templates/research_page.hjs", "utf8");
  const template = Handlebars.compile(contents);

  return template({ type: publication.guideType, year: publication.guideYear, research });
};

const group_publications_by_type = (publications) => {
  return publications.reduce((groups, publication) => {
    const group = groups.find(element => element.guideType === publication.guideType);
    if (group) {
      group.years.push(publication.guideYear);
      group.years.sort().reverse();
    } else {
      groups.push({
        id: publication.id,
        guideType: publication.guideType,
        years: [publication.guideYear]
      })
      groups = groups.sort((a, b) => a.id - b.id);
    }

    return groups;
  }, []);
}

export const render_index = async () => {
  const publications = await get_research_publications();
  const grouped_publications = group_publications_by_type(publications);

  const contents = fs.readFileSync("templates/research_index.hjs", "utf8");
  const template = Handlebars.compile(contents);

  return template({ grouped_publications });
};