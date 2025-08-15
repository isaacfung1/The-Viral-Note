import React from 'react';
import Footer from './footer';

type Props = {
    children: React.ReactNode;
}

export default function Layout({ children }: Props) {
    return (
        <>
            <main>{children}</main>
            <Footer />
        </>
    );
}