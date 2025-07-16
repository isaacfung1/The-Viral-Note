import React from 'react';
import Footer from './footer';
import { Metadata } from 'next';

type Props = {
    children: React.ReactNode;
}

export const metadata: Metadata = {
    title: 'The Viral Note',
    description: '',
    icons: {
        icon:'',
    }

}

export default function Layout({ children }: Props) {
    return (
        <>
            <main>{children}</main>
            <Footer />
        </>
    );
}