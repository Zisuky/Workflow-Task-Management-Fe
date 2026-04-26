import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import TemplateView from './TemplateView';
import AddTemplateWizard from './AddTemplateWizard';

const TemplatePage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [showWizard, setShowWizard] = useState(false);

    useEffect(() => {
        const action = searchParams.get('action');
        if (action === 'add') {
            setShowWizard(true);
        } else {
            setShowWizard(false);
        }
    }, [searchParams]);

    const handleCloseWizard = () => {
        setShowWizard(false);
        searchParams.delete('action');
        setSearchParams(searchParams);
    };

    if (showWizard) {
        return <AddTemplateWizard onClose={handleCloseWizard} />;
    }

    return <TemplateView />;
};

export default TemplatePage;
