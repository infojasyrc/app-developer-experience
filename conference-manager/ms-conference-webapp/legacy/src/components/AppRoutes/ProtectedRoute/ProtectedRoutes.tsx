import { FC } from 'react';

interface PropType {
    user: boolean;
    component: React.FC;
}

const ProtectedRoutes: FC<PropType> = ({user, component: Component}) => {
    return (!user) ?  null : <Component />
}

export default ProtectedRoutes;
