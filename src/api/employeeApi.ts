import axios from 'axios';

/* =========================
   AXIOS INSTANCE
========================= */

const externalApi = axios.create({
    baseURL: '/api/pmcc/v1',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

externalApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        if (token) {
            config.headers['token'] = token;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

externalApi.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.config?.url?.includes('/profiles/me')) {
            return Promise.reject(error);
        }
        return Promise.reject(error);
    }
);

export interface Employee {
    id: string;
    name: string;
    position_id?: string | null;
    avatar_id?: string | null;
}

const employeeByIdCache = new Map<string, Employee>();
let allEmployeesCache: Employee[] | null = null;
let loadingAllPromise: Promise<Employee[]> | null = null;

function mapRawToEmployee(raw: any, fallbackId = ''): Employee {
    return {
        id: raw.id || raw._id || fallbackId,
        name:
            raw.administrative_info?.name?.full_name ||
            `${raw.administrative_info?.name?.first_name || ''} ${raw.administrative_info?.name?.last_name || ''}`.trim() ||
            raw.Name ||
            raw.Username ||
            'Unknown',
        position_id: raw.position_id || null,
        avatar_id: raw.avatar_id || null,
    };
}


async function getEmployeeById(employeeId: string): Promise<Employee | null> {
    if (employeeByIdCache.has(employeeId)) {
        return employeeByIdCache.get(employeeId)!;
    }

    try {
        const response = await externalApi.get(`/employees/${employeeId}`);
        const raw = response.data?.result || response.data;

        if (!raw) return null;

        const employee = mapRawToEmployee(raw, employeeId);
        employeeByIdCache.set(employee.id, employee);

        return employee;
    } catch (error) {
        console.error(`Failed to fetch employee ${employeeId}:`, error);
        return null;
    }
}

async function getAllEmployees(): Promise<Employee[]> {
    if (allEmployeesCache) {
        return allEmployeesCache;
    }

    if (loadingAllPromise) {
        return loadingAllPromise;
    }

    loadingAllPromise = (async () => {
        try {
            const response = await externalApi.get('/employees');
            const rawList = response.data?.result || response.data || [];

            if (!Array.isArray(rawList)) {
                allEmployeesCache = [];
                return [];
            }

            const employees = rawList.map((raw: any) => {
                const emp = mapRawToEmployee(raw);
                employeeByIdCache.set(emp.id, emp);
                return emp;
            });

            allEmployeesCache = employees;
            return employees;
        } catch (error) {
            console.error('Failed to fetch employees:', error);
            allEmployeesCache = [];
            return [];
        } finally {
            loadingAllPromise = null;
        }
    })();

    return loadingAllPromise;
}

async function getCurrentUserProfile(): Promise<Employee | null> {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    if (!token) {
        return null;
    }

    try {
        const response = await externalApi.get('/profiles/me', {
            validateStatus: (status) => status < 500,
        });

        if (response.status >= 400) {
            return null;
        }

        const raw = response.data?.result || response.data;

        if (!raw) {
            return null;
        }

        const employeeId = raw.employee_id || raw.id || raw._id;

        if (employeeId) {
            return getEmployeeById(employeeId);
        }

        return mapRawToEmployee(raw);
    } catch (error: any) {
        return null;
    }
}


export const employeeApi = {
    async getCurrentUser(): Promise<Employee | null> {
        return getCurrentUserProfile();
    },

    async getById(employeeId: string): Promise<Employee | null> {
        return getEmployeeById(employeeId);
    },

    async getAll(): Promise<Employee[]> {
        return getAllEmployees();
    },

    async search(query: string): Promise<Employee[]> {
        const all = await getAllEmployees();
        const q = query.trim().toLowerCase();

        if (!q) return all;

        return all.filter(e =>
            e.name.toLowerCase().includes(q)
        );
    },

    clearCache() {
        employeeByIdCache.clear();
        allEmployeesCache = null;
        loadingAllPromise = null;
    },
};

export default employeeApi;
