import { useRouteError } from 'react-router-dom';
import Well from './Well';

export default function RouteError() {
    const error = useRouteError();
    console.error('Route Error', error);


    return <Well variant="danger">
        <Well.Header>Route Error</Well.Header>
        <Well.Body>
            <p>An error ocurred serving this route:</p>
            <p>{error.statusText || error.message}</p>
        </Well.Body>
    </Well>
}