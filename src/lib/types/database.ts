export type Organization = {
  id: string;
  name: string;
  created_at: string;
};

export type OrgMember = {
  id: string;
  org_id: string;
  user_id: string;
  role: string;
  created_at: string;
};

export type Contact = {
  id: string;
  org_id: string;
  phone_number: string;
  name: string | null;
  created_at: string;
};

export type Message = {
  id: string;
  contact_id: string;
  org_id: string;
  direction: "inbound" | "outbound";
  body: string;
  created_at: string;
};
