import { useState, useEffect } from 'react';
import type { CreateJobInput, JobGroup, JobPriority, JobType } from '../../../models';
import type { Member } from '../../../data/members.data';
import AddJobModalView from '../AddJobModalView';
const calculateWorkingDays = (startDate: string, endDate: string): number => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) return 0;
    let workingDays = 0;
    const currentDate = new Date(start);
    while (currentDate <= end) {
        const dayOfWeek = currentDate.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            workingDays++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return workingDays;
};
const calculateEstimatedHours = (startDate: string, endDate: string): number => {
    const workingDays = calculateWorkingDays(startDate, endDate);
    return workingDays * 8;
};
interface AddJobModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateJobInput) => void;
    defaultManager?: string;
    defaultProjectId?: string;
}
const AddJobModal: React.FC<AddJobModalProps> = ({ isOpen, onClose, onSubmit, defaultProjectId }) => {
    const [manager, setManager] = useState('');
    const [managerId, setManagerId] = useState('');
    const [selectedMembers, setSelectedMembers] = useState<Member[]>([]);
    const today = new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [estimatedHours, setEstimatedHours] = useState(8);
    useEffect(() => {
        if (isOpen) {
            setManager('');
            setManagerId('');
            setSelectedMembers([]);
            setStartDate(today);
            setEndDate(today);
            setEstimatedHours(8);
        }
    }, [isOpen, today]);
    useEffect(() => {
        const calculatedHours = calculateEstimatedHours(startDate, endDate);
        setEstimatedHours(calculatedHours);
    }, [startDate, endDate]);

    const handleManagerChange = (name: string, id?: string) => {
        setManager(name);
        setManagerId(id || '');
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        console.log('Submitting with:', {
            managerId,
            assigneeIds: selectedMembers.map(m => m.id).join(',')
        });

        const input: CreateJobInput = {
            name: formData.get('name') as string,
            type: formData.get('type') as JobType,
            group: formData.get('group') as JobGroup,
            projectId: formData.get('projectId') as string,
            description: formData.get('description') as string,
            manager: manager,
            assignee: selectedMembers.map(m => m.name).join(', '),
            assignerId: managerId,
            assigneeId: selectedMembers.map(m => m.id).join(','),
            startDate: startDate,
            endDate: endDate,
            estimatedHours: estimatedHours,
            priority: formData.get('priority') as JobPriority,

            code: 'JOB-' + Math.floor(Math.random() * 1000),
        };
        onSubmit(input);
        setSelectedMembers([]);
        onClose();
    };
    const handleStartDateChange = (date: string) => {
        setStartDate(date);
        if (endDate < date) {
            setEndDate(date);
        }
    };
    const handleEndDateChange = (date: string) => {
        if (date >= startDate) {
            setEndDate(date);
        } else {
            setEndDate(startDate);
        }
    };
    return (
        <AddJobModalView
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={handleSubmit}
            manager={manager}
            onManagerChange={handleManagerChange}
            selectedMembers={selectedMembers}
            onMembersChange={setSelectedMembers}
            startDate={startDate}
            endDate={endDate}
            estimatedHours={estimatedHours}
            onStartDateChange={handleStartDateChange}
            onEndDateChange={handleEndDateChange}
            defaultProjectId={defaultProjectId}
        />
    );
};
export default AddJobModal;

