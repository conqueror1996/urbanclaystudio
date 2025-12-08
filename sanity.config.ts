
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { projectId, dataset } from './lib/sanity'
import { schemaTypes } from './schemas'

export default defineConfig({
    basePath: '/studio',
    projectId: projectId!,
    dataset,
    plugins: [structureTool()],
    schema: {
        types: schemaTypes,
    },
})
