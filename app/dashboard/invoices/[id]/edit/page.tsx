import Form from '@/app/ui/invoices/edit-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchCustomerById, fetchCustomers, fetchInvoiceById } from '@/app/lib/data';
import { notFound } from 'next/navigation';
import { Metadata, ResolvingMetadata } from 'next';

type Props = {
    params: Promise<{ id: string }>
    // searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const id = (await params).id
    // Obviously not worth the performance impact, but just for practice (and a nice title):
    const invoice = await fetchInvoiceById(id);
    const customer = await fetchCustomerById(invoice?.customer_id);

    const previousImages = (await parent).openGraph?.images || []
    const customerName = customer?.name || '';

    return {
        title: `Edit ${invoice?.status || ''} invoice ${customerName ? ' for ' + customerName : ''}`,
        openGraph: {
            images: [...previousImages],
        },
    }
}

export default async function Page(props: { params: Promise<{ id: string }> }) {
    const { id } = await props.params;
    const [invoice, customers] = await Promise.all([
        fetchInvoiceById(id),
        fetchCustomers(),
    ]);

    if (!invoice) {
        notFound();
    }

    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    { label: 'Invoices', href: '/dashboard/invoices' },
                    {
                        label: 'Edit Invoice',
                        href: `/dashboard/invoices/${id}/edit`,
                        active: true,
                    },
                ]}
            />
            <Form invoice={invoice} customers={customers} />
        </main>
    );
}