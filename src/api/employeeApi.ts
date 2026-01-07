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
        const token = localStorage.getItem('token');
        if (token) {
            // User provided example token: QZejiJvZl09GWzt6mq/...
            // The screenshot assumes using this token for subsequent calls.
            // Using 'token' header as per previous code structure, assuming it's correct for this external API.
            config.headers['token'] = token;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

/* =========================
   TYPES
========================= */

export interface Employee {
    id: string;
    name: string;
    position_id?: string | null;
    avatar_id?: string | null;
}

/* =========================
   CACHE (IN-MEMORY)
========================= */

const employeeByIdCache = new Map<string, Employee>();
let allEmployeesCache: Employee[] | null = null;
let loadingAllPromise: Promise<Employee[]> | null = null;

/* =========================
   HELPERS
========================= */

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

/* =========================
   CORE FUNCTIONS
========================= */

async function getEmployeeById(employeeId: string): Promise<Employee | null> {
    // ✅ CACHE HIT
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
    // ✅ CACHE HIT
    if (allEmployeesCache) {
        return allEmployeesCache;
    }

    // ✅ AVOID DUPLICATE CALLS
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
    try {
        const response = await externalApi.get('/profiles/me');
        const raw = response.data?.result || response.data;

        if (!raw) return null;

        const employeeId = raw.employee_id || raw.id || raw._id;

        if (employeeId) {
            return getEmployeeById(employeeId);
        }

        return mapRawToEmployee(raw);
    } catch (error) {
        console.error('Failed to fetch current user profile:', error);
        return null;
    }
}

/* =========================
   PUBLIC API
========================= */

export const employeeApi = {
    // 👤 User đang đăng nhập
    async getCurrentUser(): Promise<Employee | null> {
        return getCurrentUserProfile();
    },

    // 👤 Lấy 1 employee
    async getById(employeeId: string): Promise<Employee | null> {
        return getEmployeeById(employeeId);
    },

    // 👥 Lấy tất cả employees (1 REQUEST DUY NHẤT)
    async getAll(): Promise<Employee[]> {
        return getAllEmployees();
    },

    // 🔍 Search LOCAL – KHÔNG GỌI API
    async search(query: string): Promise<Employee[]> {
        const all = await getAllEmployees();
        const q = query.trim().toLowerCase();

        if (!q) return all;

        return all.filter(e =>
            e.name.toLowerCase().includes(q)
        );
    },

    // ♻️ Clear cache khi logout / switch user
    clearCache() {
        employeeByIdCache.clear();
        allEmployeesCache = null;
        loadingAllPromise = null;
    },
};

export default employeeApi;
