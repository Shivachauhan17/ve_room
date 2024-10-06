import { useCookies } from 'react-cookie';

type CookieData=string | number | object;
export interface CookieService {
    setUserCookie: (value: CookieData, options?: object) => void;
    getUserCookie: () => CookieData | null;
    removeUserCookie: () => void;
    
  }

  const CookieService = ():CookieService => {
    const [cookies, setCookie, removeCookie] = useCookies(['User', 'MonitoringUser']);
  
    const setUserCookie = (value: CookieData, options = {}):void => {
      setCookie('User', value, options);
    };
  
    const getUserCookie = ():string => {
      return cookies.User || null;
    };
  
    const removeUserCookie = ():void => {
      removeCookie('User');
    };

    
  
      
  
    return {
        setUserCookie,
        getUserCookie,
        removeUserCookie,
       
    }

  };
  
export default CookieService;