import { useState, useEffect } from 'react';
import type { Member } from '../../data/members.data';
import { AddProjectModalView } from '../../features/dashboard';

interface AddProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ProjectFormData) => void;
    defaultManager?: string;
    defaultManagerId?: string;
}

// Aligned with BE CreateProjectRequest — removed code, group, startDate, endDate
export interface ProjectFormData {
    name: string;
    description: string;
    manager: string;    // display only
    members: string;    // display only
    leaderId: string;
    memberIds: string[];
    workflowId?: string;
    startDate?: string;
    endDate?: string;
}

const AddProjectModal: React.FC<AddProjectModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [selectedMembers, setSelectedMembers] = useState<Member[]>([]);
    const [manager, setManager] = useState('');
    const [managerId, setManagerId] = useState('');
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
    const today = new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);

    useEffect(() => {
        if (isOpen) {
            setManager('');
            setManagerId('');
            setSelectedMembers([]);
            setSelectedTemplateId(null);
            setStartDate(today);
            setEndDate(today);
        }
    }, [isOpen, today]);

    const isFormValid = manager.trim() !== '' && managerId.trim() !== '' && selectedMembers.length > 0;

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get('name') as string;
        if (!name?.trim() || !manager.trim() || !managerId.trim() || selectedMembers.length === 0) {
            return;
        }
        onSubmit({
            name: name,
            description: formData.get('description') as string || '',
            manager: manager,
            members: selectedMembers.map(m => m.name).join(', '),
            leaderId: managerId,
            memberIds: selectedMembers.map(m => m.id),
            workflowId: selectedTemplateId || undefined,
            startDate,
            endDate,
        });
        setSelectedMembers([]);
        setManagerId('');
    };

    const handleClose = () => {
        setSelectedMembers([]);
        setManagerId('');
        onClose();
    };

    const handleManagerChange = (name: string, id?: string) => {
        setManager(name);
        if (id) {
            setManagerId(id);
        }
    };

    return (
        <AddProjectModalView
            isOpen={isOpen}
            isFormValid={isFormValid}
            manager={manager}
            startDate={startDate}
            endDate={endDate}
            today={today}
            selectedMembers={selectedMembers}
            onClose={handleClose}
            onSubmit={handleSubmit}
            onManagerChange={handleManagerChange}
            onMembersChange={setSelectedMembers}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            selectedTemplateId={selectedTemplateId}
            onTemplateChange={setSelectedTemplateId}
        />
    );
};

export default AddProjectModal;
