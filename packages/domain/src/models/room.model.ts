export interface RoomModel {
  roomId: string;
  code: string;
  hostAccountId: string;
  createdAt: Date;
}

export interface MembershipModel {
  membershipId: string;
  roomId: string;
  accountId: string;
  joinedAt: Date;
  leftAt?: Date | null;
  lastSeenAt: Date;
}
