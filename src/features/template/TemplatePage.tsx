import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import TemplateView from './TemplateView';
import AddTemplateWizard from './AddTemplateWizard';
import { useFeatures } from '../../shared/hooks/useFeatures';

const TemplatePage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [showWizard, setShowWizard] = useState(false);

    // Feature-based permission — calls GET /api/features/active
    const { can } = useFeatures();
    const canCreate = can('WORKFLOW_CREATE');

    useEffect(() => {
        const action = searchParams.get('action');
        if (action === 'add' && canCreate) {
            setShowWizard(true);
        } else {
            setShowWizard(false);
            // Clean up the action param if user lacks permission
            if (action === 'add' && !canCreate) {
                searchParams.delete('action');
                setSearchParams(searchParams);
            }
        }
    }, [searchParams, canCreate]);

    const handleCloseWizard = () => {
        setShowWizard(false);
        searchParams.delete('action');
        setSearchParams(searchParams);
    };

    if (showWizard && canCreate) {
        return <AddTemplateWizard onClose={handleCloseWizard} />;
    }

    return <TemplateView />;
};

export default TemplatePage;
