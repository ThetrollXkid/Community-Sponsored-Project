'use client'
import Layout from '@/components/design/Layout';
import React, { useState } from 'react';
import Image from 'next/image';
import filesIcon from '../../public/navbar/files.svg';
import bookIcon from '../../public/navbar/book.svg';

const getStatus = (stock) => {
  if (stock === 0) return <span className="px-2 py-1 rounded bg-red-100 text-red-700 text-xs font-semibold">Out of Stock</span>;
  if (stock < 50) return <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-700 text-xs font-semibold">Low Stock</span>;
  return <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-semibold">In Stock</span>;
};

const initialMerchandise = [
  { id: 1, item: 'T-Shirt', category: 'Clothing', stock: 120, price: 15 },
  { id: 2, item: 'Mug', category: 'Accessories', stock: 80, price: 8 },
  { id: 3, item: 'Cap', category: 'Clothing', stock: 20, price: 12 },
];

const initialStationery = [
  { id: 1, item: 'Notebook', type: 'Paper', stock: 200, price: 3 },
  { id: 2, item: 'Pen', type: 'Writing', stock: 500, price: 1 },
  { id: 3, item: 'Eraser', type: 'Accessories', stock: 10, price: 0.5 },
];

export default function Inventory() {
  // State for Merchandise
  const [merchandise, setMerchandise] = useState(initialMerchandise);
  const [stationery, setStationery] = useState(initialStationery);

  // State for modals
  const [modal, setModal] = useState({ open: false, type: '', table: '', row: null });

  // State for form
  const [form, setForm] = useState({ item: '', category: '', type: '', stock: '', price: '' });

  // Open modal for add or edit
  const openModal = (table, type, row = null) => {
    setModal({ open: true, type, table, row });
    if (row) {
      setForm({ ...row });
    } else {
      setForm({ item: '', category: '', type: '', stock: '', price: '' });
    }
  };

  // Close modal
  const closeModal = () => {
    setModal({ open: false, type: '', table: '', row: null });
    setForm({ item: '', category: '', type: '', stock: '', price: '' });
  };

  // Handle form change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add or update row
  const handleSubmit = (e) => {
    e.preventDefault();
    if (modal.table === 'merchandise') {
      if (modal.type === 'add') {
        setMerchandise([
          ...merchandise,
          {
            id: Date.now(),
            item: form.item,
            category: form.category,
            stock: Number(form.stock),
            price: Number(form.price),
          },
        ]);
      } else if (modal.type === 'edit') {
        setMerchandise(
          merchandise.map((row) =>
            row.id === modal.row.id
              ? {
                  ...row,
                  item: form.item,
                  category: form.category,
                  stock: Number(form.stock),
                  price: Number(form.price),
                }
              : row
          )
        );
      }
    } else if (modal.table === 'stationery') {
      if (modal.type === 'add') {
        setStationery([
          ...stationery,
          {
            id: Date.now(),
            item: form.item,
            type: form.type,
            stock: Number(form.stock),
            price: Number(form.price),
          },
        ]);
      } else if (modal.type === 'edit') {
        setStationery(
          stationery.map((row) =>
            row.id === modal.row.id
              ? {
                  ...row,
                  item: form.item,
                  type: form.type,
                  stock: Number(form.stock),
                  price: Number(form.price),
                }
              : row
          )
        );
      }
    }
    closeModal();
  };

  // Delete row
  const handleDelete = (table, id) => {
    if (table === 'merchandise') {
      setMerchandise(merchandise.filter((row) => row.id !== id));
    } else if (table === 'stationery') {
      setStationery(stationery.filter((row) => row.id !== id));
    }
  };

  return (
    <Layout>
      <div className="p-8 space-y-12">
        {/* Merchandise Table */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-blue-700 flex items-center gap-2">
              <Image src={filesIcon} alt="Files Icon" width={24} height={24} />
              Merchandise
            </h2>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={() => openModal('merchandise', 'add')}
            >
              Add Merchandise
            </button>
          </div>
          <div className="overflow-x-auto rounded-lg shadow">
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-blue-100">
                <tr>
                  <th className="py-3 px-6 border-b text-left">Item</th>
                  <th className="py-3 px-6 border-b text-left">Category</th>
                  <th className="py-3 px-6 border-b text-left">Stock</th>
                  <th className="py-3 px-6 border-b text-left">Price</th>
                  <th className="py-3 px-6 border-b text-left">Status</th>
                  <th className="py-3 px-6 border-b text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {merchandise.map((row) => (
                  <tr key={row.id} className="hover:bg-blue-50">
                    <td className="py-3 px-6 border-b">{row.item}</td>
                    <td className="py-3 px-6 border-b">{row.category}</td>
                    <td className="py-3 px-6 border-b">{row.stock}</td>
                    <td className="py-3 px-6 border-b">${row.price}</td>
                    <td className="py-3 px-6 border-b">{getStatus(row.stock)}</td>
                    <td className="py-3 px-6 border-b space-x-2">
                      <button
                        className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded hover:bg-yellow-300"
                        onClick={() => openModal('merchandise', 'edit', row)}
                      >
                        Edit
                      </button>
                      <button
                        className="px-2 py-1 bg-red-200 text-red-800 rounded hover:bg-red-300"
                        onClick={() => handleDelete('merchandise', row.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stationery Table */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-green-700 flex items-center gap-2">
              <Image src={bookIcon} alt="Book Icon" width={24} height={24} />
              Stationery
            </h2>
            <button
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              onClick={() => openModal('stationery', 'add')}
            >
              Add Stationery
            </button>
          </div>
          <div className="overflow-x-auto rounded-lg shadow">
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-green-100">
                <tr>
                  <th className="py-3 px-6 border-b text-left">Item</th>
                  <th className="py-3 px-6 border-b text-left">Type</th>
                  <th className="py-3 px-6 border-b text-left">Stock</th>
                  <th className="py-3 px-6 border-b text-left">Price</th>
                  <th className="py-3 px-6 border-b text-left">Status</th>
                  <th className="py-3 px-6 border-b text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {stationery.map((row) => (
                  <tr key={row.id} className="hover:bg-green-50">
                    <td className="py-3 px-6 border-b">{row.item}</td>
                    <td className="py-3 px-6 border-b">{row.type}</td>
                    <td className="py-3 px-6 border-b">{row.stock}</td>
                    <td className="py-3 px-6 border-b">${row.price}</td>
                    <td className="py-3 px-6 border-b">{getStatus(row.stock)}</td>
                    <td className="py-3 px-6 border-b space-x-2">
                      <button
                        className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded hover:bg-yellow-300"
                        onClick={() => openModal('stationery', 'edit', row)}
                      >
                        Edit
                      </button>
                      <button
                        className="px-2 py-1 bg-red-200 text-red-800 rounded hover:bg-red-300"
                        onClick={() => handleDelete('stationery', row.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal for Add/Edit */}
        {modal.open && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">
                {modal.type === 'add' ? 'Add' : 'Edit'}{' '}
                {modal.table === 'merchandise' ? 'Merchandise' : 'Stationery'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block mb-1 font-semibold">Item</label>
                  <input
                    type="text"
                    name="item"
                    className="w-full border px-3 py-2 rounded"
                    value={form.item}
                    onChange={handleChange}
                    required
                  />
                </div>
                {modal.table === 'merchandise' ? (
                  <div>
                    <label className="block mb-1 font-semibold">Category</label>
                    <input
                      type="text"
                      name="category"
                      className="w-full border px-3 py-2 rounded"
                      value={form.category}
                      onChange={handleChange}
                      required
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block mb-1 font-semibold">Type</label>
                    <input
                      type="text"
                      name="type"
                      className="w-full border px-3 py-2 rounded"
                      value={form.type}
                      onChange={handleChange}
                      required
                    />
                  </div>
                )}
                <div>
                  <label className="block mb-1 font-semibold">Stock</label>
                  <input
                    type="number"
                    name="stock"
                    className="w-full border px-3 py-2 rounded"
                    value={form.stock}
                    onChange={handleChange}
                    required
                    min={0}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Price</label>
                  <input
                    type="number"
                    name="price"
                    className="w-full border px-3 py-2 rounded"
                    value={form.price}
                    onChange={handleChange}
                    required
                    min={0}
                    step="0.01"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                  >
                    {modal.type === 'add' ? 'Add' : 'Update'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
