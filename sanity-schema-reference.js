export default {
  name: 'architecturalImage',
  title: 'AI Generated Architecture',
  type: 'document',
  fields: [
    {name: 'title', type: 'string', title: 'Title'},
    {name: 'description', type: 'text', title: 'Description'},
    {name: 'image', type: 'image', title: 'Image', options: {hotspot: true}},
    {name: 'style', type: 'string', title: 'Style'},
    {name: 'material', type: 'string', title: 'Material Focus'},
    {name: 'colorProfile', type: 'string', title: 'Color Profile'},
    {name: 'projectType', type: 'string', title: 'Project Type'},
    {name: 'climate', type: 'string', title: 'Climate'},
    {name: 'lightingStyle', type: 'string', title: 'Lighting'},
    {name: 'compositionStyle', type: 'string', title: 'Composition'},
    {name: 'textureLevel', type: 'string', title: 'Texture Level'},
    {name: 'embeddingHint', type: 'text', title: 'Embedding Prompt'},
    {name: 'generatedAt', type: 'datetime', title: 'Generated At'}
  ]
}
