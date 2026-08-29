import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="font-syne font-extrabold text-8xl text-brand-cyan">404</h1>
      <p className="text-gray-400 text-lg mt-4">Page not found — this route doesn't exist.</p>
      <Link to="/" className="mt-8"><Button>Go Home</Button></Link>
    </div>
  );
}
