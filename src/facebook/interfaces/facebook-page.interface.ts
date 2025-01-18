export interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  category: string;
  // Add other relevant fields as needed
}

export interface FacebookPagesResponse {
  data: FacebookPage[];
  paging: {
    cursors: {
      before: string;
      after: string;
    };
    next?: string;
  };
}
