// Shared status codes for FE
// 0=pending, 1=accepted, 2=rejected

export const BaseStatus = Object.freeze({
  PENDING: 0,
  ACCEPTED: 1,
  REJECTED: 2,
} as const);

export type BaseStatusCode = (typeof BaseStatus)[keyof typeof BaseStatus];

export const BaseStatusNames: Record<BaseStatusCode, 'pending' | 'accepted' | 'rejected'> = {
  [BaseStatus.PENDING]: 'pending',
  [BaseStatus.ACCEPTED]: 'accepted',
  [BaseStatus.REJECTED]: 'rejected',
};

export function toBaseStatusCode(input?: number | string | null): BaseStatusCode {
  if (typeof input === 'number') return [0, 1, 2].includes(input) ? (input as BaseStatusCode) : BaseStatus.PENDING;
  if (!input) return BaseStatus.PENDING;
  const s = String(input).toLowerCase();
  if (s === 'accepted') return BaseStatus.ACCEPTED;
  if (s === 'rejected') return BaseStatus.REJECTED;
  return BaseStatus.PENDING;
}

export function toBaseStatusName(code?: number | null): 'pending' | 'accepted' | 'rejected' {
  if (code === 0 || code === 1 || code === 2) return BaseStatusNames[code as BaseStatusCode];
  return 'pending';
}

// Offer-specific helpers
export const OfferStatus = {
  PENDING: BaseStatus.PENDING,
  ACCEPTED: BaseStatus.ACCEPTED,
  REJECTED: BaseStatus.REJECTED,
} as const;

export type OfferStatusCode = BaseStatusCode;

export function offerStatusToCode(input?: number | string | null): OfferStatusCode {
  return toBaseStatusCode(input ?? undefined);
}

export function offerCodeToStatusString(code?: number | null): 'pending' | 'accepted' | 'rejected' {
  return toBaseStatusName(code ?? undefined);
}
