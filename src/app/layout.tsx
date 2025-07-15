import type { Metadata } from 'next';
import Footer from '../components/footer';

export const metadata: Metadata = {
    title: "The Viral Note",
    description: "",

}
export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}){
    return (
        <html lang="en">
            <body>
                {children}
                <Footer />
            </body>
        </html>
    )
}
    
