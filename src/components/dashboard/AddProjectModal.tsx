import { useState, useEffect } from 'react';
import type { Member } from '../../data/members.data';
import AddProjectModalView from '../../views/dashboard/AddProjectModalView';

interface AddProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ProjectFormData) => void;
    defaultManager?: string;
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
}

const AddProjectModal: React.FC<AddProjectModalProps> = ({ isOpen, onClose, onSubmit, defaultManager = '' }) => {
    const [selectedMembers, setSelectedMembers] = useState<Member[]>([]);
    const [manager, setManager] = useState(defaultManager);
    const [managerId, setManagerId] = useState('');
    const today = new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);

    useEffect(() => {
        if (isOpen) {
            setManager(defaultManager);
            setManagerId('');
        }
    }, [defaultManager, isOpen]);

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
            onClose={handleClose}
            onSubmit={handleSubmit}
            onManagerChange={handleManagerChange}
            onMembersChange={setSelectedMembers}
            onStartDateChange={handleStartDateChange}
            onEndDateChange={setEndDate}
        />
    );
};

export default AddProjectModal;
