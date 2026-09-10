"use client"

import * as React from "react"
import { Button } from "@/shared/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form"
import { Input } from "@/shared/components/ui/input"
import { ProductEntity } from "../../../../domain/entities/product.entity"
import { useProductForm } from "../../hooks/use-product-form"

export function ProductForm({ initialData }: { initialData?: ProductEntity }) {
  const { form, onSubmit, isEditing } = useProductForm(initialData)

  return (
    <Form {...form}>
      <form method="post" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" data-testid="product-form">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter product name" {...field} data-testid="product-name-input" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="Enter product description" {...field} value={field.value || ""} data-testid="product-description-input" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price ($)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0.00"
                  {...field}
                  onChange={e => field.onChange(parseFloat(e.target.value))}
                  data-testid="product-price-input"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          data-testid={isEditing ? "update-product-submit-button" : "create-product-submit-button"}
        >
          {form.formState.isSubmitting ? "Saving..." : isEditing ? "Update Product" : "Create Product"}
        </Button>
      </form>
    </Form>
  )
}
