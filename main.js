const loadSales = async () => {
    const data = await fetch(
        "https://tradewinds-stack-eu-north-1.s3.eu-north-1.amazonaws.com/app_data/sales.json",
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        },
    ).then((response) => response.json());

    console.log(data);

    const {
        weekly_sales,
        categories_weekly_share,
        mean_sale_per_order_week,
        top_ten_products,
        top_ten_customers,
        employee_sales_per_category,
    } = data;

    const weeklyPercentageCategories = Object.keys(categories_weekly_share)
        .filter((category) => category !== "week")
        .map(
            (week) =>
                new Object({
                    name: week,
                    data: [...categories_weekly_share[week]],
                }),
        );

    Highcharts.chart("employee-category-heatmap", {
        chart: {
            type: "heatmap",
        },

        title: {
            text: "product category sales total per employee",
        },

        xAxis: {
            categories: employee_sales_per_category.employees,
        },

        yAxis: {
            categories: employee_sales_per_category.categories,
            reversed: true,
            title: {
                text: "€ Euro value",
            },
        },

        colorAxis: {
            min: 0,
            minColor: "#FFFFFF",
            maxColor: Highcharts.getOptions().colors[0],
        },

        legend: {
            align: "right",
            layout: "vertical",
            margin: 20,
            verticalAlign: "middle",
        },

        tooltip: {
            format: "{series.xAxis.categories.(point.x)}, {series.yAxis.categories.(point.y)} : €{point.value}",
        },

        series: [
            {
                data: employee_sales_per_category.matrix,
                dataLabels: {
                    enabled: true,
                    color: "contrast",
                    format: '€ {point.value:,.2f}'
                },
            },
        ],
    });

    Highcharts.chart("top-ten-customers", {
        legend: { enabled: false },
        chart: {
            type: "column",
        },
        title: {
            text: "top ten customers",
        },
        xAxis: {
            categories: top_ten_customers.map(
                (customers) => customers.customer_name,
            ),
        },
        yAxis: {
            min: 0,
            title: {
                text: "€ Euro value",
            },
        },
        tooltip: {
            pointFormat: "€{point.y}",
        },
        series: [
            {
                name: "customers",
                data: top_ten_customers.map((customer) => customer.sales),
            },
        ],
    });

    Highcharts.chart("top-ten-products", {
        legend: { enabled: false },
        chart: {
            type: "column",
        },
        title: {
            text: "top ten products",
        },
        xAxis: {
            categories: top_ten_products.map((product) => product.product_name),
        },
        yAxis: {
            min: 0,
            title: {
                text: "€ Euro value",
            },
        },
        tooltip: {
            pointFormat: "€{point.y}",
        },
        series: [
            {
                name: "products",
                data: top_ten_products.map((product) => product.sales),
            },
        ],
    });

    Highcharts.chart("weekly-area", {
        chart: {
            type: "area",
        },
        title: {
            text: "product category sales share by business week",
        },
        xAxis: {
            categories: categories_weekly_share["week"],
        },
        yAxis: {
            title: {
                text: "% Percent",
            },
        },
        tooltip: {
            shared: true,
        },
        plotOptions: {
            area: {
                stacking: "percent",
            },
        },
        series: weeklyPercentageCategories,
    });

    Highcharts.chart("weekly-sales-mean", {
        legend: { enabled: false },
        chart: {
            type: "spline",
        },
        title: {
            text: "mean sales order value by business week",
        },
        xAxis: {
            categories: mean_sale_per_order_week.map((week) => week.week),
        },
        yAxis: {
            type: "logarithmic",
            title: {
                text: "€ Euro value",
            },
        },
        tooltip: {
            pointFormat: "€{point.y}",
        },
        series: [
            {
                name: "sales",
                data: mean_sale_per_order_week.map(
                    (week) => week.mean_sale_per_order,
                ),
                color: "var(--highcharts-color-1, #2caffe)",
            },
        ],
    });

    Highcharts.chart("weekly-sales", {
        legend: { enabled: false },
        chart: {
            type: "spline",
        },
        title: {
            text: "week sales total by business week",
        },
        xAxis: {
            categories: weekly_sales.map((week) => week.week),
        },
        yAxis: {
            type: "logarithmic",
            title: {
                text: "€ Euro value",
            },
        },
        tooltip: {
            pointFormat: "€{point.y}",
        },
        series: [
            {
                name: "sales",
                data: weekly_sales.map((week) => week.sales),
                color: "var(--highcharts-color-1, #2caffe)",
            },
        ],
    });
};
