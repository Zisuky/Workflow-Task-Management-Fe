import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { jobService } from '../services/job.service';
import type { Job } from '../models';
import { JobListView } from '../views/job';
const JobListPage: React.FC = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [allJobs, setAllJobs] = useState<Job[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const navigate = useNavigate();
    const location = useLocation();

    const projectId = location.state?.projectId as string | undefined;

    const loadJobs = useCallback(async () => {
        setIsLoading(true);
        let data: Job[];
        if (projectId) {
            data = await jobService.getJobsByProject(projectId);
        } else {
            data = await jobService.getJobs();
        }
        setAllJobs(data);
        setIsLoading(false);
    }, [projectId]);

    useEffect(() => {
        loadJobs();
    }, [loadJobs]);
    useEffect(() => {
        let filtered = allJobs;
        if (searchTerm) {
            filtered = allJobs.filter(job =>
                job.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                job.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                job.project?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        setJobs(filtered.slice(startIndex, endIndex));
    }, [allJobs, searchTerm, currentPage, itemsPerPage]);
    const handleSearchChange = (term: string) => {
        setSearchTerm(term);
        setCurrentPage(1);
    };
    const handleItemsPerPageChange = (count: number) => {
        setItemsPerPage(count);
        setCurrentPage(1);
    };
    const filteredCount = searchTerm
        ? allJobs.filter(job =>
            job.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.project?.toLowerCase().includes(searchTerm.toLowerCase())
        ).length
        : allJobs.length;
    const handleJobClick = (jobId: string) => {
        navigate(`/job/${jobId}`);
    };
    return (
        <JobListView
            jobs={jobs}
            isLoading={isLoading}
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            totalCount={filteredCount}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={handleItemsPerPageChange}
            onJobClick={handleJobClick}
        />
    );
};
export default JobListPage;
