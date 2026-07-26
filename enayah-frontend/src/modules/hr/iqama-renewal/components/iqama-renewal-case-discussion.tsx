// enayah-frontend/src/modules/hr/iqama-renewal/components/iqama-renewal-case-discussion.tsx

'use client'

import { type FormEvent, useMemo, useState } from 'react'
import {
  AlertCircle,
  LoaderCircle,
  MessageSquareText,
  Reply,
  Send,
  X,
} from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

import {
  useCreateIqamaRenewalCaseComment,
  useIqamaRenewalCaseComments,
  useReplyToIqamaRenewalCaseComment,
} from '../hooks/use-iqama-renewal-comments'

import type {
  IqamaRenewalCaseComment,
  IqamaRenewalCaseCommentNode,
} from '../types/iqama-renewal-comment.types'

import { buildIqamaRenewalCommentTree } from './iqama-renewal-comment-tree'
import { IqamaRenewalStatusBadge } from './iqama-renewal-status-badge'

interface Props {
  caseId: string
  canComment?: boolean
}

interface CommentItemProps {
  comment: IqamaRenewalCaseCommentNode
  locale: string
  isArabic: boolean
  canComment: boolean
  depth?: number

  replyingToCommentId: string | null
  replyBody: string
  isReplying: boolean

  onStartReply: (comment: IqamaRenewalCaseComment) => void

  onCancelReply: () => void
  onReplyBodyChange: (value: string) => void
  onSubmitReply: (event: FormEvent<HTMLFormElement>) => void
}

const MAX_COMMENT_LENGTH = 2000

function formatCommentDate(value: string, locale: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat(locale, {
    calendar: 'gregory',
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function getAuthorName(comment: IqamaRenewalCaseComment, isArabic: boolean) {
  const localizedName = isArabic
    ? comment.authorNameAr || comment.authorNameEn
    : comment.authorNameEn || comment.authorNameAr

  return (
    localizedName ||
    comment.authorUsername ||
    comment.authorEmail ||
    'Unknown user'
  )
}

function getAuthorInitial(authorName: string) {
  const normalized = authorName.trim()

  return normalized ? normalized.charAt(0).toUpperCase() : '?'
}

function CommentItem({
  comment,
  locale,
  isArabic,
  canComment,
  depth = 0,
  replyingToCommentId,
  replyBody,
  isReplying,
  onStartReply,
  onCancelReply,
  onReplyBodyChange,
  onSubmitReply,
}: CommentItemProps) {
  const t = useTranslations('iqamaRenewal')

  const authorName = getAuthorName(comment, isArabic)

  const isReplyEditorOpen = replyingToCommentId === comment.id

  /*
   * Cap visual indentation while preserving actual
   * parent-child relationships.
   */
  const visualDepth = Math.min(depth, 3)

  return (
    <div
      className={cn(
        visualDepth > 0 && 'border-s border-border/70 ps-3 sm:ps-5',
      )}
    >
      <article className='rounded-2xl border border-border/60 bg-background p-4 shadow-sm transition-shadow hover:shadow-md'>
        <div className='flex items-start gap-3'>
          <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/15 bg-primary/10 text-sm font-semibold text-primary'>
            {getAuthorInitial(authorName)}
          </div>

          <div className='min-w-0 flex-1'>
            <div className='flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between'>
              <div className='min-w-0'>
                <p className='truncate text-sm font-semibold text-foreground'>
                  {authorName}
                </p>

                <p className='mt-0.5 text-xs text-muted-foreground'>
                  {formatCommentDate(comment.createdAt, locale)}
                </p>
              </div>

              <div className='shrink-0'>
                <IqamaRenewalStatusBadge status={comment.statusAtTime} />
              </div>
            </div>

            <p className='mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-foreground/85'>
              {comment.body}
            </p>

            {canComment && (
              <div className='mt-3'>
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  className='h-8 rounded-lg px-2 text-muted-foreground'
                  disabled={isReplying}
                  onClick={() => onStartReply(comment)}
                >
                  <Reply className='h-3.5 w-3.5' />
                  {t('reply')}
                </Button>
              </div>
            )}
          </div>
        </div>

        {isReplyEditorOpen && (
          <form
            className='mt-4 rounded-xl border bg-muted/20 p-3'
            onSubmit={onSubmitReply}
          >
            <div className='mb-3 flex items-center justify-between gap-3'>
              <p className='min-w-0 truncate text-xs text-muted-foreground'>
                {t('replyingTo', {
                  name: authorName,
                })}
              </p>

              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='h-8 w-8 shrink-0'
                disabled={isReplying}
                onClick={onCancelReply}
              >
                <X className='h-4 w-4' />
                <span className='sr-only'>{t('cancelReply')}</span>
              </Button>
            </div>

            <Textarea
              value={replyBody}
              rows={3}
              maxLength={MAX_COMMENT_LENGTH}
              disabled={isReplying}
              placeholder={t('writeReply')}
              className='min-h-24 resize-none bg-background'
              onChange={(event) => onReplyBodyChange(event.target.value)}
            />

            <div className='mt-3 flex items-center justify-between gap-3'>
              <span className='text-xs text-muted-foreground'>
                {replyBody.length}/{MAX_COMMENT_LENGTH}
              </span>

              <Button
                type='submit'
                size='sm'
                disabled={!replyBody.trim() || isReplying}
              >
                {isReplying ? (
                  <LoaderCircle className='h-4 w-4 animate-spin' />
                ) : (
                  <Send className='h-4 w-4' />
                )}

                {t('postReply')}
              </Button>
            </div>
          </form>
        )}
      </article>

      {comment.replies.length > 0 && (
        <div className='mt-3 space-y-3'>
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              locale={locale}
              isArabic={isArabic}
              canComment={canComment}
              depth={depth + 1}
              replyingToCommentId={replyingToCommentId}
              replyBody={replyBody}
              isReplying={isReplying}
              onStartReply={onStartReply}
              onCancelReply={onCancelReply}
              onReplyBodyChange={onReplyBodyChange}
              onSubmitReply={onSubmitReply}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function IqamaRenewalCaseDiscussion({
  caseId,
  canComment = false,
}: Props) {
  const t = useTranslations('iqamaRenewal')
  const locale = useLocale()
  const isArabic = locale.toLowerCase().startsWith('ar')

  const {
    data: comments = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useIqamaRenewalCaseComments(caseId)

  const createComment = useCreateIqamaRenewalCaseComment(caseId)

  const replyToComment = useReplyToIqamaRenewalCaseComment(caseId)

  const [commentBody, setCommentBody] = useState('')

  const [replyingTo, setReplyingTo] = useState<IqamaRenewalCaseComment | null>(
    null,
  )

  const [replyBody, setReplyBody] = useState('')

  const commentTree = useMemo(
    () => buildIqamaRenewalCommentTree(comments),
    [comments],
  )

  async function handleSubmitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const body = commentBody.trim()

    if (!body || createComment.isPending) {
      return
    }

    try {
      await createComment.mutateAsync({
        body,
      })

      setCommentBody('')
    } catch {
      // Hook displays the error toast.
    }
  }

  function handleStartReply(comment: IqamaRenewalCaseComment) {
    setReplyingTo(comment)
    setReplyBody('')
  }

  function handleCancelReply() {
    if (replyToComment.isPending) {
      return
    }

    setReplyingTo(null)
    setReplyBody('')
  }

  async function handleSubmitReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const body = replyBody.trim()

    if (!body || !replyingTo || replyToComment.isPending) {
      return
    }

    try {
      await replyToComment.mutateAsync({
        commentId: replyingTo.id,
        payload: {
          body,
        },
      })

      setReplyingTo(null)
      setReplyBody('')
    } catch {
      // Hook displays the error toast.
    }
  }

  return (
    <section className='overflow-hidden rounded-3xl border border-border/60 bg-card shadow-[0_20px_60px_-38px_rgba(15,23,42,0.35)]'>
      <header className='flex flex-col gap-4 border-b border-border/60 bg-gradient-to-br from-primary/[0.06] via-background to-background px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6'>
        <div className='flex items-start gap-3'>
          <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary'>
            <MessageSquareText className='h-5 w-5' />
          </div>

          <div>
            <h2 className='font-semibold text-foreground'>
              {t('caseDiscussion')}
            </h2>

            <p className='mt-1 text-sm text-muted-foreground'>
              {t('caseDiscussionDescription')}
            </p>
          </div>
        </div>

        <div className='rounded-full border bg-background/80 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm'>
          {t('commentCount', {
            count: comments.length,
          })}
        </div>
      </header>

      <div className='space-y-5 p-5 sm:p-6'>
        {canComment && (
          <form
            className='rounded-2xl border border-border/60 bg-muted/[0.18] p-4'
            onSubmit={handleSubmitComment}
          >
            <Textarea
              value={commentBody}
              rows={4}
              maxLength={MAX_COMMENT_LENGTH}
              disabled={createComment.isPending}
              placeholder={t('writeComment')}
              className='min-h-28 resize-none bg-background'
              onChange={(event) => setCommentBody(event.target.value)}
            />

            <div className='mt-3 flex items-center justify-between gap-3'>
              <span className='text-xs text-muted-foreground'>
                {commentBody.length}/{MAX_COMMENT_LENGTH}
              </span>

              <Button
                type='submit'
                disabled={!commentBody.trim() || createComment.isPending}
              >
                {createComment.isPending ? (
                  <LoaderCircle className='h-4 w-4 animate-spin' />
                ) : (
                  <Send className='h-4 w-4' />
                )}

                {t('postComment')}
              </Button>
            </div>
          </form>
        )}

        {isLoading && (
          <div className='flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground'>
            <LoaderCircle className='h-4 w-4 animate-spin' />
            {t('loadingComments')}
          </div>
        )}

        {isError && (
          <div className='rounded-2xl border border-destructive/20 bg-destructive/[0.04] p-5'>
            <div className='flex items-start gap-3'>
              <AlertCircle className='mt-0.5 h-5 w-5 shrink-0 text-destructive' />

              <div className='flex-1'>
                <p className='text-sm font-semibold text-destructive'>
                  {t('loadCommentsFailed')}
                </p>

                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  className='mt-3'
                  disabled={isFetching}
                  onClick={() => {
                    void refetch()
                  }}
                >
                  {isFetching && (
                    <LoaderCircle className='h-4 w-4 animate-spin' />
                  )}

                  {t('retry')}
                </Button>
              </div>
            </div>
          </div>
        )}

        {!isLoading && !isError && commentTree.length === 0 && (
          <div className='rounded-2xl border border-dashed bg-muted/10 px-5 py-12 text-center'>
            <MessageSquareText className='mx-auto h-8 w-8 text-muted-foreground/50' />

            <p className='mt-3 text-sm font-medium text-foreground'>
              {t('noComments')}
            </p>

            <p className='mt-1 text-xs text-muted-foreground'>
              {t('noCommentsDescription')}
            </p>
          </div>
        )}

        {!isLoading && !isError && commentTree.length > 0 && (
          <div className='space-y-4'>
            {commentTree.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                locale={locale}
                isArabic={isArabic}
                canComment={canComment}
                replyingToCommentId={replyingTo?.id ?? null}
                replyBody={replyBody}
                isReplying={replyToComment.isPending}
                onStartReply={handleStartReply}
                onCancelReply={handleCancelReply}
                onReplyBodyChange={setReplyBody}
                onSubmitReply={handleSubmitReply}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
