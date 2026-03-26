export type TableViewType = 'contacts' | 'invoices' | 'quotes';

export type TableView = {
  id: string;
  name: string;
  type: TableViewType;
  filters: Record<string, unknown>;
  createdAt: string;
};
