export const render_guides_json = async (data) => {
  const guides = [];
  for (const guide of data) {
    guides.push({
      id: guide.publicationTypeId,
      name: guide.publicationTypeDescription,
    });
  }


  guides.sort((a, b) => a.id - b.id);

  return JSON.stringify(
    {
      guides,
    },
    null,
    2
  );
};
