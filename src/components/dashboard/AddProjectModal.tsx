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

export interface ProjectFormData {
    name: string;
    code: string;
    group: string;
    description: string;
    manager: string;
    members: string;
    leaderId: string;
    memberIds: string[];
    startDate: string;
    endDate: string;
    workflowTemplateId?: string;
}

const AddProjectModal: React.FC<AddProjectModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [selectedMembers, setSelectedMembers] = useState<Member[]>([]);
    const [manager, setManager] = useState('');
    const [managerId, setManagerId] = useState('');
    const today = new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setManager('');
            setManagerId('');
            setSelectedMembers([]);
            setStartDate(today);
            setEndDate(today);
            setSelectedTemplateId(null);
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
            code: '',
            group: formData.get('group') as string || '',
            description: formData.get('description') as string || '',
            manager: manager,
            members: selectedMembers.map(m => m.name).join(', '),
            leaderId: managerId,
            memberIds: selectedMembers.map(m => m.id),
            startDate: formData.get('startDate') as string || '',
            endDate: formData.get('endDate') as string || '',
            workflowTemplateId: selectedTemplateId || undefined,
        });
        setSelectedMembers([]);
        setManagerId('');
    };

    const handleClose = () => {
        setSelectedMembers([]);
        setManagerId('');
        onClose();
    };

    const handleStartDateChange = (date: string) => {
        setStartDate(date);
        if (endDate < date) {
            setEndDate(date);
        }
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
            selectedTemplateId={selectedTemplateId}
            onClose={handleClose}
            onSubmit={handleSubmit}
            onManagerChange={handleManagerChange}
            onMembersChange={setSelectedMembers}
            onStartDateChange={handleStartDateChange}
            onEndDateChange={setEndDate}
            onTemplateChange={setSelectedTemplateId}
        />
    );
};

export default AddProjectModal;
