// enayah-frontenfd/src/modules/hr/iqama-renewal/components/iqama-renewal-comment-tree.ts

import type {
  IqamaRenewalCaseComment,
  IqamaRenewalCaseCommentNode,
} from '../types/iqama-renewal-comment.types'

export function buildIqamaRenewalCommentTree(
  comments: IqamaRenewalCaseComment[],
): IqamaRenewalCaseCommentNode[] {
  const nodes = new Map<string, IqamaRenewalCaseCommentNode>()

  for (const comment of comments) {
    nodes.set(comment.id, {
      ...comment,
      replies: [],
    })
  }

  const roots: IqamaRenewalCaseCommentNode[] = []

  for (const comment of comments) {
    const node = nodes.get(comment.id)

    if (!node) {
      continue
    }

    if (!comment.parentCommentId) {
      roots.push(node)
      continue
    }

    const parent = nodes.get(comment.parentCommentId)

    /*
     * Treat an orphan as a root instead of hiding it.
     * The backend should prevent this, but this keeps the
     * UI resilient to legacy or imported records.
     */
    if (!parent) {
      roots.push(node)
      continue
    }

    parent.replies.push(node)
  }

  return roots
}
