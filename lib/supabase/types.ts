export type ProfileRole = "user" | "companion";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: ProfileRole;
          is_online: boolean | null;
          created_at: string;
        };
        Insert: {
          id: string;
          role: ProfileRole;
          is_online?: boolean | null;
          created_at?: string;
        };
        Update: {
          role?: ProfileRole;
          is_online?: boolean | null;
        };
        Relationships: [];
      };
      companion_profiles: {
        Row: {
          id: string;
          went_through: string;
          how_long_ago: string;
          support_style: string;
          created_at: string | null;
        };
        Insert: {
          id: string;
          went_through: string;
          how_long_ago: string;
          support_style: string;
          created_at?: string | null;
        };
        Update: {
          went_through?: string;
          how_long_ago?: string;
          support_style?: string;
        };
        Relationships: [];
      };
      match_requests: {
        Row: {
          id: string;
          user_id: string | null;
          companion_id: string | null;
          experience_tag: string | null;
          intensity_tag: string | null;
          style_tag: string | null;
          status: string | null;
          voice_room_url: string | null;
          companion_briefing: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          companion_id?: string | null;
          experience_tag?: string | null;
          intensity_tag?: string | null;
          style_tag?: string | null;
          status?: string | null;
          voice_room_url?: string | null;
          companion_briefing?: string | null;
          created_at?: string | null;
        };
        Update: {
          user_id?: string | null;
          companion_id?: string | null;
          experience_tag?: string | null;
          intensity_tag?: string | null;
          style_tag?: string | null;
          status?: string | null;
          voice_room_url?: string | null;
          companion_briefing?: string | null;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          room_id: string;
          sender_id: string;
          content: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          room_id: string;
          sender_id: string;
          content: string;
          created_at?: string | null;
        };
        Update: {
          content?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
