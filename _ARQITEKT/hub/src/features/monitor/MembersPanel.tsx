import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Users, Trash2 } from 'lucide-react';
import {
  useGetMembersQuery,
  useAddMemberMutation,
  useUpdateMemberRoleMutation,
  useRemoveMemberMutation,
  type ProjectRole,
  type ProjectMember,
} from '@/store/api/projectsApi';
import { Spinner } from '@/components/ui/Spinner';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import styles from './MembersPanel.module.css';

const ROLES: ProjectRole[] = ['owner', 'editor', 'viewer'];
const ROLE_OPTIONS = ROLES.map((r) => ({ value: r, label: r }));

export function MembersPanel() {
  const { t } = useTranslation();
  const { projectId } = useParams<{ projectId: string }>();
  const { data, isLoading } = useGetMembersQuery(projectId!, { skip: !projectId });
  const [addMember] = useAddMemberMutation();
  const [updateRole] = useUpdateMemberRoleMutation();
  const [removeMember] = useRemoveMemberMutation();

  const [username, setUsername] = useState('');
  const [role, setRole] = useState<ProjectRole>('editor');

  async function handleAdd() {
    if (!username.trim() || !projectId) return;
    await addMember({ projectId, userId: username.trim(), username: username.trim(), role });
    setUsername('');
  }

  async function handleRoleChange(member: ProjectMember, newRole: ProjectRole) {
    if (!projectId) return;
    await updateRole({ projectId, userId: member.userId, role: newRole });
  }

  async function handleRemove(userId: string) {
    if (!projectId) return;
    await removeMember({ projectId, userId });
  }

  const members = data?.members ?? [];

  return (
    <section className={styles.panel}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          <Users size={16} style={{ marginRight: 6, verticalAlign: 'text-bottom' }} />
          {t('members', 'Members')}
        </h3>
      </div>

      {isLoading && (
        <div className={styles.center}>
          <Spinner size="sm" />
        </div>
      )}

      {!isLoading && members.length === 0 && (
        <p className={styles.empty}>{t('noMembers', 'No members configured. All authenticated users have full access.')}</p>
      )}

      {members.length > 0 && (
        <ul className={styles.list}>
          {members.map((m) => (
            <li key={m.userId} className={styles.row}>
              <span className={styles.username}>{m.username}</span>
              <Select
                value={m.role}
                onChange={(e) => handleRoleChange(m, e.target.value as ProjectRole)}
                options={ROLE_OPTIONS}
                selectSize="sm"
              />
              <div className={styles.actions}>
                <button
                  className={styles.iconBtn}
                  onClick={() => handleRemove(m.userId)}
                  title={t('removeMember', 'Remove')}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className={styles.addForm}>
        <Input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder={t('memberUsername', 'Username or user ID')}
          onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
        />
        <Select
          value={role}
          onChange={(e) => setRole(e.target.value as ProjectRole)}
          options={ROLE_OPTIONS}
          selectSize="sm"
        />
        <Button
          variant="filled"
          size="sm"
          onClick={handleAdd}
          disabled={!username.trim()}
        >
          {t('addMember', 'Add')}
        </Button>
      </div>
    </section>
  );
}
