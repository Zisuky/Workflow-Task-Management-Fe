import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobService } from '../services';
import type { Job } from '../models';
import { JobDetailView, type JobUpdateData } from '../views/job';
const JobDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [job, setJob] = useState<Job | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        const loadJob = async () => {
            if (!id) {
                navigate('/job');
                return;
            }
            setIsLoading(true);
            try {
                const jobData = await jobService.getJobById(id);
                setJob(jobData || null);
            } catch (error) {
                console.error('Failed to load job:', error);
                navigate('/job');
            } finally {
                setIsLoading(false);
            }
        };
        loadJob();
    }, [id, navigate]);
    const handleBack = () => {
        navigate('/job');
    };
    const handleUpdate = async (data: JobUpdateData) => {
        if (!job) return;
        try {
            const updatedJob = await jobService.updateJob(job.id, {
                priority: data.priority,
                status: data.status,
                description: data.description,
                group: data.group,
                type: data.type,
                typeId: data.typeId,
                taskGroupId: data.taskGroupId,
            });
            if (updatedJob) {
                setJob({
                    ...updatedJob,
                    group: data.group,
                    type: data.type,
                    typeId: data.typeId,
                    taskGroupId: data.taskGroupId,
                });
                alert('Cập nhật thành công!');
            }
        } catch (error) {
            console.error('Failed to update job:', error);
            alert('Cập nhật thất bại!');
        }
    };
    const handleDelete = async () => {
        if (!job) return;
        if (window.confirm('Bạn có chắc chắn muốn xóa công việc này?')) {
            try {
                await jobService.deleteJob(job.id);
                navigate('/job');
            } catch (error) {
                console.error('Failed to delete job:', error);
            }
        }
    };
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-orange-200 rounded-full animate-spin border-t-[#F79E61]"></div>
                    <span className="text-gray-500 animate-pulse">Đang tải...</span>
                </div>
            </div>
        );
    }
    if (!job) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Không tìm thấy công việc</h2>
                    <button
                        onClick={handleBack}
                        className="text-[#F79E61] hover:text-[#e88d50] transition-colors"
                    >
                        Quay lại danh sách
                    </button>
                </div>
            </div>
        );
    }
    return (
        <JobDetailView
            job={job}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
        />
    );
};
export default JobDetailPage;
