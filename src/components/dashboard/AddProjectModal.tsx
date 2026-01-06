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
    startDate: string;
    endDate: string;
}
const AddProjectModal: React.FC<AddProjectModalProps> = ({ isOpen, onClose, onSubmit, defaultManager = '' }) => {
    const [selectedMembers, setSelectedMembers] = useState<Member[]>([]);
    const [manager, setManager] = useState(defaultManager);
    const today = new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    useEffect(() => {
        if (isOpen) {
            setManager(defaultManager);
        }
    }, [defaultManager, isOpen]);
    const isFormValid = manager.trim() !== '' && selectedMembers.length > 0;
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get('name') as string;
        const code = formData.get('code') as string;
        if (!name.trim() || !code.trim() || !manager.trim() || selectedMembers.length === 0) {
            return;
        }
        onSubmit({
            name: name,
            code: code,
            group: formData.get('group') as string,
            description: formData.get('description') as string,
            manager: manager,
            members: selectedMembers.map(m => m.name).join(', '),
            startDate: formData.get('startDate') as string,
            endDate: formData.get('endDate') as string,
        });
        setSelectedMembers([]);
    };
    const handleClose = () => {
        setSelectedMembers([]);
        onClose();
    };
    const handleStartDateChange = (date: string) => {
        setStartDate(date);
        if (endDate < date) {
            setEndDate(date);
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
            onManagerChange={setManager}
            onMembersChange={setSelectedMembers}
            onStartDateChange={handleStartDateChange}
            onEndDateChange={setEndDate}
        />
    );
};
export default AddProjectModal;
