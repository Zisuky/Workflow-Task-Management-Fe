import React, { useState, useEffect } from 'react';
import type { CreateTaskInput } from '../../../shared/types/task';
import type { TaskPriority } from '../../../shared/types';
import type { Member } from '../../../data/members.data';
import AddTaskModalView from './AddTaskModalView';
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
interface AddTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateTaskInput) => void;
    defaultManager?: string;
    defaultManagerId?: string;
    defaultProjectId?: string;
}
const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, onSubmit, defaultManager = '', defaultManagerId = '', defaultProjectId }) => {
    const [manager, setManager] = useState(defaultManager);
    const [managerId, setManagerId] = useState('');
    const [selectedMembers, setSelectedMembers] = useState<Member[]>([]);
    const today = new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [estimatedHours, setEstimatedHours] = useState(8);
    useEffect(() => {
        if (isOpen) {
            setManager(defaultManager);
            setManagerId(defaultManagerId);
            setSelectedMembers([]);
            setStartDate(today);
            setEndDate(today);
            setEstimatedHours(8);
        }
    }, [isOpen, today, defaultManager, defaultManagerId]);
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

        const input = {
            name: formData.get('name') as string,
            taskGroupId: formData.get('group') as string,
            projectId: formData.get('projectId') as string,
            description: formData.get('description') as string,
            assignerId: managerId,
            assigneeId: selectedMembers.map(m => m.id).join(','),
            startDate: startDate,
            endDate: endDate,
            priority: formData.get('priority') as TaskPriority,
        } as unknown as CreateTaskInput;
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
        <AddTaskModalView
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
export default AddTaskModal;

