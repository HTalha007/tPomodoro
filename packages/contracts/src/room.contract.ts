export interface RoomMemberDto {
  accountId: string;
  email: string;
  totalCreditedSeconds: number;
  lastSeenAt: string;
  isOnline: boolean; // true if lastSeenAt within 30 seconds
}

export interface RoomResponseDto {
  roomId: string;
  code: string;
  isHost: boolean;
  members: RoomMemberDto[];
  serverNow: string;
}

export interface JoinRoomDto {
  code: string;
}
