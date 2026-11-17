import { PageHeader } from '@/components/ui/page-header';

export default function WorkspacePageHeader({ title, description, actions, leading, id, className }) {
  return (
    <PageHeader
      title={title}
      description={description}
      actions={actions}
      leading={leading}
      id={id}
      className={className}
    />
  );
}
