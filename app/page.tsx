import Dashboard from './Dashboard';
import { getContracts, getUsers } from './actions/contract-actions';
import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function Home() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    // Fetch initial data on the server
    const contracts = await getContracts();
    const users = await getUsers();

    const currentUser = (session.user as any)?.id;

    return (
        <Dashboard
            initialContracts={contracts}
            currentUser={currentUser}
            users={users}
        />
    );
}
