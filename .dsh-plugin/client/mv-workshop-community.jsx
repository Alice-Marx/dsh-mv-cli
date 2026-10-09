/** Optional public statistics and policy awards. No account feature or voting action. */
import React from 'react'
import { workshopMetricText } from '../shared/mv-workshop-community.mjs'

const TEXT = Object.freeze({
  community: '\u793e\u533a\u7edf\u8ba1',
  loading: '\u793e\u533a\u7edf\u8ba1\u8bfb\u53d6\u4e2d\u2026',
  ready: '\u793e\u533a\u6570\u636e\u5df2\u66f4\u65b0',
  stale: '\u7f13\u5b58\u793e\u533a\u7edf\u8ba1',
  offline: '\u793e\u533a\u7edf\u8ba1\u79bb\u7ebf',
  unavailable: '\u793e\u533a\u7edf\u8ba1\u6682\u4e0d\u53ef\u7528',
  explanation: '\u201c\u2014\u201d\u8868\u793a\u6682\u65e0\u771f\u5b9e\u7edf\u8ba1\uff1b\u4e0b\u8f7d\u548c\u672c\u673a\u7ba1\u7406\u53ef\u7ee7\u7eed\u4f7f\u7528\u3002',
  downloads: '\u6210\u529f\u4e0b\u8f7d',
  users: '\u4e0b\u8f7d\u8005',
  unique: '\u7531\u793e\u533a\u7edf\u8ba1\u63d0\u4f9b\u7684\u53bb\u91cd\u4e0b\u8f7d\u8005',
  likes: '\u70b9\u8d5e',
  unavailableMetric: '\u6682\u65e0\u771f\u5b9e\u7edf\u8ba1',
  acclaimed: '\u5e7f\u53d7\u597d\u8bc4',
  awarded: '\u6388\u4e88\u4e8e',
})

function CommunityIcon({ kind }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {kind === 'downloads' && <><path d="M12 3v12m-4-4 4 4 4-4" /><path d="M4 16v4h16v-4" /></>}
      {kind === 'users' && <><circle cx="9" cy="8" r="3" /><path d="M3 20v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6M17 14a5 5 0 0 1 4 5v1" /></>}
      {kind === 'likes' && <path d="M20.8 4.6a5.3 5.3 0 0 0-7.5 0L12 5.9l-1.3-1.3a5.3 5.3 0 0 0-7.5 7.5L12 21l8.8-8.9a5.3 5.3 0 0 0 0-7.5Z" />}
      {kind === 'trophy' && <><path d="M8 3h8v6a4 4 0 0 1-8 0V3ZM8 5H4v2a4 4 0 0 0 4 4M16 5h4v2a4 4 0 0 1-4 4M12 13v5M8 21h8M10 18h4v3" /></>}
    </svg>
  )
}

export function WorkshopCommunityStatus({ community, loading = false, error = '' }) {
  const status = community?.status ?? 'unavailable'
  const known = status === 'ready' || status === 'stale'
  return (
    <section className="mv-ws-community" aria-label={TEXT.community}>
      <div className="mv-row mv-ws-community-heading">
        <span className={'mv-ws-community-state' + (known ? ' mv-ws-community-known' : '')} role="status" aria-live="polite">
          {loading ? TEXT.loading : TEXT[status] ?? TEXT.unavailable}
        </span>
        {known && community.fetchedAt && <time className="mv-caption" dateTime={community.fetchedAt}>{community.fetchedAt.replace('T', ' ').slice(0, 16)} UTC</time>}
      </div>
      <p className="mv-caption">{TEXT.explanation}</p>
      {error && <p className="mv-caption mv-ws-community-error">{error}</p>}
    </section>
  )
}

export function WorkshopStatistics({ title, record = null, compact = false }) {
  const metrics = [
    ['downloads', TEXT.downloads, record?.downloadCount],
    ['users', TEXT.users, record?.uniqueDownloadUsers],
    ['likes', TEXT.likes, record?.likeCount],
  ]
  return (
    <dl className={'mv-ws-stats' + (compact ? ' mv-ws-stats-compact' : '')} aria-label={title + ' ' + TEXT.community}>
      {metrics.map(([kind, label, value]) => (
        <div key={kind}>
          <dt title={kind === 'users' ? TEXT.unique : undefined}><CommunityIcon kind={kind} /><span>{label}</span></dt>
          <dd aria-label={(kind === 'users' ? TEXT.unique : label) + '\uff1a' + (value == null ? TEXT.unavailableMetric : workshopMetricText(value))}>{workshopMetricText(value)}</dd>
        </div>
      ))}
    </dl>
  )
}

export function WorkshopTrophy({ record = null, policy = null, compact = false }) {
  const award = record?.acclaimed
  if (!award || !policy || award.criterion !== policy.id) return null
  const description = TEXT.acclaimed + '\uff1a' + policy.description + '\uff1b' + TEXT.awarded + ' ' + award.awardedAt.slice(0, 10)
  return (
    <div className="mv-ws-award">
      <span className="mv-ws-trophy" role="img" aria-label={description} title={description}>
        <CommunityIcon kind="trophy" /><span>{TEXT.acclaimed}</span>
      </span>
      {!compact && <span className="mv-caption mv-ws-award-rule">{policy.description}{' \u00b7 '}{TEXT.awarded} {award.awardedAt.slice(0, 10)}</span>}
    </div>
  )
}
