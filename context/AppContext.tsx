
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { ContentItem, User, BrandId, Comment } from '../types';
import { INITIAL_CONTENT } from '../constants';

interface AppContextType {
  content: ContentItem[];
  user: User | null;
  addContent: (item: ContentItem) => void;
  register: (name: string, email: string) => void;
  login: (email: string) => void;
  logout: () => void;
  updateSubscription: (plan: 'Free' | 'Monthly' | 'Yearly') => void;
  updateProfile: (data: Partial<User>) => void;
  filterContentByBrand: (brandId: BrandId) => ContentItem[];
  interactWithContent: (id: string, type: 'like' | 'love' | 'dislike' | 'comment') => void;
  addComment: (contentId: string, text: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<ContentItem[]>(INITIAL_CONTENT);
  // Initialize user from localStorage immediately to avoid null flash on refresh
  const [user, setUser] = useState<User | null>(() => {
      try {
          const stored = localStorage.getItem('samonyaUser');
          return stored ? JSON.parse(stored) : null;
      } catch (e) {
          return null;
      }
  });

  // Update local storage whenever user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('samonyaUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('samonyaUser');
    }
  }, [user]);

  const addContent = (item: ContentItem) => {
    setContent(prev => [item, ...prev]);
  };

  const register = (name: string, email: string) => {
    const adminEmails = ['snmomanyik@gmail.com', 'samonyadigital@gmail.com'];
    const isAdmin = adminEmails.includes(email.trim().toLowerCase());

    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      isPremium: isAdmin,
      isAdmin: isAdmin,
      joinedDate: new Date().toISOString(),
      plan: isAdmin ? 'Yearly' : 'Free'
    };
    setUser(newUser);
  };

  const login = (email: string) => {
    const adminEmails = ['snmomanyik@gmail.com', 'samonyadigital@gmail.com'];
    const lowerEmail = email.trim().toLowerCase();
    const isAdmin = adminEmails.includes(lowerEmail);
    
    // Simulate fetching existing user data, or create a session
    setUser({
      id: 'u1',
      name: isAdmin ? 'Admin User' : 'Samonya Fan',
      email: lowerEmail,
      isPremium: isAdmin,
      isAdmin: isAdmin,
      joinedDate: '2023-01-15',
      plan: isAdmin ? 'Yearly' : 'Free'
    });
  };

  const logout = () => {
    setUser(null);
  };

  const updateSubscription = (plan: 'Free' | 'Monthly' | 'Yearly') => {
    if (user) {
      setUser({ ...user, plan, isPremium: plan !== 'Free' });
    }
  };

  const updateProfile = (data: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...data });
    }
  };

  const filterContentByBrand = (brandId: BrandId) => {
    return content.filter(item => item.brandId === brandId);
  };

  const interactWithContent = (id: string, type: 'like' | 'love' | 'dislike' | 'comment') => {
    setContent(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          interactions: {
            ...item.interactions,
            [type + 's']: item.interactions[(type + 's') as keyof typeof item.interactions] + 1
          }
        };
      }
      return item;
    }));
  };

  const addComment = (contentId: string, text: string) => {
    const colors = ['bg-pink-500', 'bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    const newComment: Comment = {
        id: Date.now().toString(),
        userName: user ? user.name : 'Guest',
        text: text,
        timestamp: new Date().toISOString(),
        avatarColor: randomColor
    };

    setContent(prev => prev.map(item => {
        if (item.id === contentId) {
            return {
                ...item,
                interactions: {
                    ...item.interactions,
                    comments: item.interactions.comments + 1
                },
                commentList: [newComment, ...(item.commentList || [])]
            };
        }
        return item;
    }));
  };

  return (
    <AppContext.Provider value={{ 
      content, 
      user, 
      addContent, 
      register,
      login, 
      logout, 
      updateSubscription,
      updateProfile,
      filterContentByBrand,
      interactWithContent,
      addComment
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

/* --- CUSTOM ROUTER IMPLEMENTATION --- */

interface RouterContextType {
  path: string;
  navigate: (to: string, options?: { replace?: boolean }) => void;
}

const RouterContext = createContext<RouterContextType | null>(null);
const RouteParamsContext = createContext<Record<string, string>>({});

export const CustomRouter: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [path, setPath] = useState(window.location.hash.slice(1) || '/');

  useEffect(() => {
    const onHashChange = () => setPath(window.location.hash.slice(1) || '/');
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = (to: string, options?: { replace?: boolean }) => {
    if (options?.replace) {
       const url = new URL(window.location.href);
       url.hash = to;
       window.location.replace(url.toString());
    } else {
       window.location.hash = to;
    }
  };

  return (
    <RouterContext.Provider value={{ path, navigate }}>
      {children}
    </RouterContext.Provider>
  );
};

export const useLocation = () => {
  const ctx = useContext(RouterContext);
  if (!ctx) return { pathname: '/' };
  return { pathname: ctx.path };
};

export const useNavigate = () => {
  const ctx = useContext(RouterContext);
  if (!ctx) return (to: string) => window.location.hash = to;
  return ctx.navigate;
};

export const useParams = <T extends Record<string, string | undefined> = Record<string, string>>() => {
  return useContext(RouteParamsContext) as T;
};

export const Link: React.FC<{ to: string; className?: string; children: ReactNode; onClick?: () => void }> = ({ to, className, children, onClick }) => {
  const { navigate } = useContext(RouterContext) || { navigate: (t: string) => window.location.hash = t };
  return (
    <a 
      href={`#${to}`} 
      className={className} 
      onClick={(e) => {
        e.preventDefault();
        if (onClick) onClick();
        navigate(to);
      }}
    >
      {children}
    </a>
  );
};

export const Navigate: React.FC<{ to: string; replace?: boolean }> = ({ to, replace }) => {
  const navigate = useNavigate();
  useEffect(() => navigate(to, { replace }), [to, replace, navigate]);
  return null;
};

export const Routes: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { pathname } = useLocation();
  let element: ReactNode = null;
  let params: Record<string, string> = {};

  React.Children.forEach(children, child => {
    if (element || !React.isValidElement(child)) return;
    
    // Safely cast props and check for existence of path
    const props = child.props as { path?: string; element?: ReactNode };
    const routePath = props.path;
    const routeElem = props.element;
    
    if (typeof routePath !== 'string') return;

    // Matcher
    const patternParts = routePath.split('/').filter(Boolean);
    const pathParts = pathname.split('/').filter(Boolean);
    
    if (patternParts.length === pathParts.length) {
        let match = true;
        let currentParams: Record<string, string> = {};
        for (let i = 0; i < patternParts.length; i++) {
            if (patternParts[i].startsWith(':')) {
                currentParams[patternParts[i].slice(1)] = pathParts[i];
            } else if (patternParts[i] !== pathParts[i]) {
                match = false;
                break;
            }
        }
        if (match) {
            element = routeElem;
            params = currentParams;
        }
    }
  });

  return (
    <RouteParamsContext.Provider value={params}>
      {element}
    </RouteParamsContext.Provider>
  );
};

export const Route: React.FC<{ path: string; element: ReactNode }> = () => null;
