// src/types/squad.ts

// Backend SquadPositionRequestDto에 대응
export interface SquadPositionRequestDto {
    fieldPositionCode: string; // 예: 'gk', 'cb1'
    teamMemberId: number | null; // 백엔드 TeamMember의 ID
  }
  
  // Backend SquadRequestDto에 대응
  export interface SquadRequestDto {
    teamId: number; // 백엔드 Team의 ID (selectedTeamId는 string이므로 number로 변환 필요)
    formationType: string; // 예: '4-3-3'
    positionRequestDtoList: SquadPositionRequestDto[]; // 포지션 목록
  }
  
  // Backend SquadResponse.SquadPositionResponse에 대응 (조회 시 사용)
  // playerActualPosition과 playerRating 필드 제거
  export interface SquadPositionResponse {
    id: number; // SquadPosition 엔티티의 ID (백엔드에서 자동 생성)
    fieldPositionCode: string; // 예: 'gk', 'cb1'
    teamMemberId: number | null;
    playerName: string | null; // 백엔드에서 조인하여 제공
  }
  
  // Backend SquadResponse에 대응
  export interface SquadResponse {
    id: number; // Squad 엔티티의 ID
    teamId: number;
    formationType: string;
    isDefault: boolean;
    createdAt: string; // LocalDateTime은 ISO 8601 문자열로 직렬화될 것임
    updatedAt: string; // LocalDateTime은 ISO 8601 문자열로 직렬화될 것임
    positions: SquadPositionResponse[]; // SquadPositionResponse 배열
  }