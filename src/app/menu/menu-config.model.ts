// src/app/models/layout-config.model.ts
export interface MenuConfig {
    header: {
      title: string;
      backgroundColor: string;
    };
    subheader: {
      title: string;
      backgroundColor: string;
    };
    sideMenu: {
      items: Array<{ title: string; link: string }>;
      backgroundColor: 'white';
    };
  }
  