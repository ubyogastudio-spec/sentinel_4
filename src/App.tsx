import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from '@/app/routes';
import { LocaleProvider } from '@/i18n/LocaleProvider';

export default function App() {
  return (
    <LocaleProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </LocaleProvider>
  );
}
