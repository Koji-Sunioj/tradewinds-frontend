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

    const {
        country_sales,
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

    const topology = await fetch(
        "https://code.highcharts.com/mapdata/custom/world.topo.json",
    ).then((response) => response.json());

    const weekChangeDataClasses = (countries) => {
        const values = countries["week-change"].map((country) => country[1]);
        values.sort();
        const min = Math.min(...values);
        const max = Math.max(...values);

        const dataClasses = [];
        const min_colors = ["#ff0000", "#ff8080", "#ffe6e6"];

        for (let i = 1; i <= 3; i++) {
            dataClasses.push({ from: min / i, color: min_colors[i - 1] });
        }

        dataClasses.push({ from: 0, color: "#e6f0ff" });

        const max_colors = ["#0066ff", "#80b3ff"];

        for (let i = 3; i != 1; i--) {
            dataClasses.push({ from: max / i, color: max_colors[i - 2] });
        }
        return dataClasses;
    };

    const values = country_sales["week-change"].map((country) => country[1]);

    Highcharts.mapChart("country-change", {
        chart: {
            map: topology,
        },

        colorAxis: {
            dataClasses: weekChangeDataClasses(country_sales),
        },
        title: {
            text: "sales week change",
        },

        mapNavigation: {
            enabled: true,
            buttonOptions: {
                alignTo: "spacingBox",
            },
        },

        tooltip: {
            valuePrefix: "€",
        },

        series: [
            {
                color: "#FFFFFF",
                name: "sales week change",
                data: country_sales["week-change"],
                dataLabels: {
                    enabled: true,
                    format: "{point.value:,.2f}",
                },
                states: {
                    hover: {
                        color: "#BADA55",
                    },
                },
            },
        ],
    });
    Highcharts.mapChart("country-sales", {
        chart: {
            map: topology,
        },

        title: {
            text: `sales for period: ${country_sales.period}`,
        },

        mapNavigation: {
            enabled: true,
            buttonOptions: {
                alignTo: "spacingBox",
            },
        },
        colorAxis: {
            min: 0,
        },

        tooltip: {
            valuePrefix: "€",
        },

        series: [
            {
                name: `Sales for period: ${country_sales.period}`,
                data: country_sales["sales"],
                dataLabels: {
                    enabled: true,
                    format: "{point.value:,.2f}",
                },
                states: {
                    hover: {
                        color: "#BADA55",
                    },
                },
            },
        ],
    });

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
                    format: "€ {point.value:,.2f}",
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
