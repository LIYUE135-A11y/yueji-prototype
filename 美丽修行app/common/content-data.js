import { getGrassDetail } from './grass-data.js'
import { getTopicDetail } from './topic-data.js'
import { getArticleDetail } from './article-data.js'

export function getContentDetail(type, id) {
  const key = String(type || '').toLowerCase()
  if (key === 'post' || key === 'grass') return getGrassDetail(id)
  if (key === 'topic') return getTopicDetail(id)
  if (key === 'article') return getArticleDetail(id)
  return null
}
