import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Button } from '../ui/Button';
import { Download, ArrowLeft, FileText, Eye } from 'lucide-react';
import { useGlobal } from '../../context/GlobalContext';
import { formatCurrency, isWithinTimeRange, TimeRange } from '../../lib/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useLanguage } from '../../context/LanguageContext';

interface FinancialReportsProps {
  onBack: () => void;
}

interface ReportData {
  title: string;
  head: string[];
  body: any[][];
}

export function FinancialReports({ onBack }: FinancialReportsProps) {
  const { products, sales, transactions, customers, suppliers, businessSettings } = useGlobal();
  const { t } = useLanguage();
  const [timeRange, setTimeRange] = useState<TimeRange>('all');
  const [viewingReport, setViewingReport] = useState<ReportData | null>(null);

  const filteredSales = useMemo(() => {
    return sales.filter(s => isWithinTimeRange(s.date, timeRange));
  }, [sales, timeRange]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => isWithinTimeRange(t.date, timeRange));
  }, [transactions, timeRange]);

  const generatePDF = (data: ReportData) => {
    const doc = new jsPDF();
    
    // Business Header
    doc.setFontSize(24);
    doc.setTextColor(79, 70, 229); // Indigo 600
    doc.text(businessSettings.businessName, 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // Slate 500
    if (businessSettings.ownerName) {
      doc.text(`${t('Owner')}: ${businessSettings.ownerName}`, 14, 28);
      doc.text(businessSettings.phone, 14, 33);
      doc.text(businessSettings.address, 14, 38);
    } else {
      doc.text(businessSettings.phone, 14, 28);
      doc.text(businessSettings.address, 14, 33);
    }
    
    // Report Title
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42); // Slate 900
    doc.text(data.title, 14, 50);
    
    doc.setFontSize(10);
    const timeRangeText = t(timeRange === 'all' ? 'All Time' : timeRange === 'today' ? 'Today' : timeRange === 'week' ? 'This Week' : timeRange === 'month' ? 'This Month' : 'This Year');
    doc.text(`${t('Time Range:')} ${timeRangeText}`, 14, 57);
    
    autoTable(doc, {
      startY: 63,
      head: [data.head],
      body: data.body,
    });

    doc.save(`${data.title.toLowerCase().replace(/\s+/g, '-')}.pdf`);
  };

  const getBalanceSheetData = (): ReportData => {
    const liquidCash = transactions.reduce((sum, t) => {
      if (t.type === 'sale' || t.type === 'income' || t.type === 'adjustment') return sum + t.amount;
      if (t.type === 'purchase' || t.type === 'expense') return sum - t.amount;
      return sum;
    }, 0);
    const stockValue = products.reduce((sum, p) => sum + (p.cost * p.quantity), 0);
    const totalAssets = liquidCash + stockValue;

    return {
      title: t('Professional Balance Sheet'),
      head: [t('Asset Type'), t('Amount')],
      body: [
        [t('Liquid Cash'), formatCurrency(liquidCash)],
        [t('Stock Value'), formatCurrency(stockValue)],
        [t('Total Assets'), formatCurrency(totalAssets)],
      ]
    };
  };

  const getProfitLossData = (): ReportData => {
    const revenue = filteredSales.reduce((sum, s) => sum + s.grandTotal, 0) + 
                    filteredTransactions.filter(t => t.type === 'sale').reduce((sum, t) => sum + t.amount, 0);
    const expenses = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    
    let cogs = 0;
    filteredSales.forEach(sale => {
      sale.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          cogs += product.cost * item.quantity;
        }
      });
    });
      // Removed mock COGS addition

    const netProfit = revenue - cogs - expenses;

    return {
      title: t('Profit and Loss Statement'),
      head: [t('Category'), t('Amount')],
      body: [
        [t('Total Revenue'), formatCurrency(revenue)],
        [t('Cost of Goods Sold (COGS)'), formatCurrency(cogs)],
        [t('Gross Profit'), formatCurrency(revenue - cogs)],
        [t('Total Expenses'), formatCurrency(expenses)],
        [t('Net Profit'), formatCurrency(netProfit)],
      ]
    };
  };

  const getProductStockData = (): ReportData => {
    return {
      title: t('Product Stock'),
      head: [t('SKU'), t('Name'), t('Category'), t('Quantity'), t('Cost'), t('Total Value')],
      body: products.map(p => [
        p.sku,
        p.name,
        p.category || t('N/A'),
        p.quantity.toString(),
        formatCurrency(p.cost),
        formatCurrency(p.cost * p.quantity)
      ])
    };
  };

  const getPurchaseReportData = (): ReportData => {
    const purchases = filteredTransactions.filter(t => t.type === 'purchase');
    return {
      title: t('Purchase Report'),
      head: [t('Date'), t('Description'), t('Amount')],
      body: purchases.map(p => [
        new Date(p.date).toLocaleDateString(),
        p.description,
        formatCurrency(p.amount)
      ])
    };
  };

  const getSaleReportData = (): ReportData => {
    return {
      title: t('Sale Report'),
      head: [t('Date'), t('Invoice ID'), t('Customer'), t('Items'), t('Total')],
      body: filteredSales.map(s => [
        new Date(s.date).toLocaleDateString(),
        s.id,
        s.customerName || t('Walk-in Customer'),
        s.items.reduce((sum, i) => sum + i.quantity, 0).toString(),
        formatCurrency(s.grandTotal)
      ])
    };
  };

  const getCustomerLedgerData = (): ReportData => {
    return {
      title: t('Customer Ledger'),
      head: [t('Customer Name'), t('Mobile'), t('Total Spent')],
      body: customers.map(c => {
        const spent = sales.filter(s => s.customerName === c.name).reduce((sum, s) => sum + s.grandTotal, 0);
        return [c.name, c.mobile || t('N/A'), formatCurrency(spent)];
      })
    };
  };

  const getExpenseReportData = (): ReportData => {
    const expenses = filteredTransactions.filter(t => t.type === 'expense');
    return {
      title: t('Expense Report'),
      head: [t('Date'), t('Category'), t('Description'), t('Amount')],
      body: expenses.map(e => [
        new Date(e.date).toLocaleDateString(),
        e.category || t('Uncategorized'),
        e.description,
        formatCurrency(e.amount)
      ])
    };
  };

  const reports = [
    { title: t('Professional Balance Sheet'), description: t('Overview of assets, liabilities, and equity.'), getData: getBalanceSheetData },
    { title: t('Profit and Loss Statement'), description: t('Summary of revenues, costs, and expenses.'), getData: getProfitLossData },
    { title: t('Product Stock'), description: t('Current inventory levels and valuation.'), getData: getProductStockData },
    { title: t('Purchase Report'), description: t('Detailed log of all purchases made.'), getData: getPurchaseReportData },
    { title: t('Sale Report'), description: t('Detailed log of all sales transactions.'), getData: getSaleReportData },
    { title: t('Customer Ledger'), description: t('Record of customer transactions and balances.'), getData: getCustomerLedgerData },
    { title: t('Expense Report'), description: t('Breakdown of all business expenses.'), getData: getExpenseReportData },
  ];

  const handleView = (report: any) => {
    setViewingReport(report.getData());
  };

  const handleDownload = (report: any) => {
    generatePDF(report.getData());
  };

  if (viewingReport) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setViewingReport(null)} className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">{viewingReport.title}</h1>
              <p className="text-slate-500 dark:text-slate-400">{t('Time Range:')} {t(timeRange === 'all' ? 'All Time' : timeRange === 'today' ? 'Today' : timeRange === 'week' ? 'This Week' : timeRange === 'month' ? 'This Month' : 'This Year')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => generatePDF(viewingReport)}>
              <Download className="mr-2 h-4 w-4" />
              {t('Download PDF')}
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-900/50 dark:text-slate-400">
                  <tr>
                    {viewingReport.head.map((h, i) => (
                      <th key={i} className="px-4 py-3 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {viewingReport.body.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                      {row.map((cell, j) => (
                        <td key={j} className="px-4 py-3">{cell}</td>
                      ))}
                    </tr>
                  ))}
                  {viewingReport.body.length === 0 && (
                    <tr>
                      <td colSpan={viewingReport.head.length} className="px-4 py-8 text-center text-slate-500">
                        {t('No data available for this report.')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">{t('Financial Reports')}</h1>
            <p className="text-slate-500 dark:text-slate-400">{t('Generate and download detailed financial documents.')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 shadow-sm"
          >
            <option value="today">{t('Today')}</option>
            <option value="week">{t('This Week')}</option>
            <option value="month">{t('This Month')}</option>
            <option value="year">{t('This Year')}</option>
            <option value="all">{t('All Time')}</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report, index) => (
          <Card key={index} className="hover:border-indigo-300 transition-colors dark:hover:border-indigo-700">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-500" />
                {report.title}
              </CardTitle>
              <CardDescription>{report.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button onClick={() => handleView(report)} className="w-full" variant="outline">
                <Eye className="mr-2 h-4 w-4" />
                {t('View')}
              </Button>
              <Button onClick={() => handleDownload(report)} className="w-full" variant="default">
                <Download className="mr-2 h-4 w-4" />
                {t('PDF')}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
