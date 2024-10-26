// differs from Location that it only shows children
export interface LocationTreeNode {
  id: number;
  name: string;
  locationNumber: string;
  building: string;
  area: number;
  children: LocationTreeNode[];
}
