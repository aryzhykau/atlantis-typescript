export interface IMenuItems {
    title: string;
    link: string;
    icon: React.ReactNode;
    page: React.ReactNode;
    mobilePage: React.ReactNode;
    ownerOnly?: boolean;
    mobileOnly?: boolean;
}
