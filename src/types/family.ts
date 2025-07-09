
export interface FamilyGroup {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface FamilyMember {
  id: string;
  family_group_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  is_creator?: boolean;
}

export interface FamilyInvitation {
  id: string;
  family_group_id: string;
  email: string;
  invited_by: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  expires_at: string;
  family_name?: string;
  inviter_name?: string;
}

export interface FamilyContextType {
  currentFamily: FamilyGroup | null;
  familyMembers: FamilyMember[];
  familyInvitations: FamilyInvitation[];
  pendingInvitations: FamilyInvitation[];
  isCreator: boolean;
  createFamily: (name: string) => Promise<FamilyGroup>;
  inviteMember: (email: string) => Promise<void>;
  acceptInvitation: (invitationId: string) => Promise<void>;
  declineInvitation: (invitationId: string) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  leaveFamily: () => Promise<void>;
  loading: boolean;
  refreshFamily: () => Promise<void>;
}
