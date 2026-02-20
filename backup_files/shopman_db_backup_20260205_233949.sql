--
-- PostgreSQL database dump
--

-- Dumped from database version 15.11
-- Dumped by pg_dump version 15.11

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: banks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.banks (
    id integer NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.banks OWNER TO postgres;

--
-- Name: banks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.banks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.banks_id_seq OWNER TO postgres;

--
-- Name: banks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.banks_id_seq OWNED BY public.banks.id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description character varying(255),
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.categories_id_seq OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: expenses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.expenses (
    id integer NOT NULL,
    ref_no character varying(100) NOT NULL,
    vendor_id integer NOT NULL,
    account_type character varying NOT NULL,
    description character varying,
    amount double precision NOT NULL,
    payment_method character varying NOT NULL,
    bank_id integer,
    expense_date timestamp without time zone NOT NULL,
    created_at timestamp without time zone,
    status character varying,
    is_active boolean,
    created_by integer
);


ALTER TABLE public.expenses OWNER TO postgres;

--
-- Name: expenses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.expenses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.expenses_id_seq OWNER TO postgres;

--
-- Name: expenses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.expenses_id_seq OWNED BY public.expenses.id;


--
-- Name: inventory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventory (
    id integer NOT NULL,
    product_id integer NOT NULL,
    quantity_in double precision,
    quantity_out double precision,
    adjustment_total double precision,
    current_stock double precision,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


ALTER TABLE public.inventory OWNER TO postgres;

--
-- Name: inventory_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.inventory_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.inventory_id_seq OWNER TO postgres;

--
-- Name: inventory_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.inventory_id_seq OWNED BY public.inventory.id;


--
-- Name: license_keys; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.license_keys (
    id integer NOT NULL,
    key character varying NOT NULL,
    is_active boolean,
    created_at timestamp without time zone,
    expiration_date timestamp without time zone NOT NULL
);


ALTER TABLE public.license_keys OWNER TO postgres;

--
-- Name: license_keys_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.license_keys_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.license_keys_id_seq OWNER TO postgres;

--
-- Name: license_keys_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.license_keys_id_seq OWNED BY public.license_keys.id;


--
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id integer NOT NULL,
    sale_invoice_no integer NOT NULL,
    amount_paid double precision NOT NULL,
    discount_allowed double precision,
    payment_method character varying NOT NULL,
    bank_id integer,
    reference_no character varying,
    balance_due double precision,
    status character varying,
    payment_date timestamp without time zone,
    created_by integer,
    created_at timestamp without time zone
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.payments_id_seq OWNER TO postgres;

--
-- Name: payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payments_id_seq OWNED BY public.payments.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id integer NOT NULL,
    name character varying NOT NULL,
    category_id integer NOT NULL,
    type character varying,
    cost_price double precision,
    selling_price double precision,
    is_active boolean NOT NULL,
    created_at timestamp without time zone
);


ALTER TABLE public.products OWNER TO postgres;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.products_id_seq OWNER TO postgres;

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: purchases; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchases (
    id integer NOT NULL,
    product_id integer NOT NULL,
    vendor_id integer,
    quantity integer NOT NULL,
    cost_price double precision NOT NULL,
    total_cost double precision NOT NULL,
    purchase_date timestamp without time zone,
    invoice_no character varying(50) NOT NULL
);


ALTER TABLE public.purchases OWNER TO postgres;

--
-- Name: purchases_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.purchases_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.purchases_id_seq OWNER TO postgres;

--
-- Name: purchases_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.purchases_id_seq OWNED BY public.purchases.id;


--
-- Name: sale_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sale_items (
    id integer NOT NULL,
    sale_invoice_no integer NOT NULL,
    product_id integer,
    quantity integer NOT NULL,
    selling_price double precision NOT NULL,
    total_amount double precision NOT NULL,
    gross_amount double precision NOT NULL,
    discount double precision,
    net_amount double precision NOT NULL
);


ALTER TABLE public.sale_items OWNER TO postgres;

--
-- Name: sale_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sale_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sale_items_id_seq OWNER TO postgres;

--
-- Name: sale_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sale_items_id_seq OWNED BY public.sale_items.id;


--
-- Name: sales; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sales (
    id integer NOT NULL,
    invoice_no integer NOT NULL,
    invoice_date timestamp without time zone NOT NULL,
    ref_no character varying,
    customer_name character varying,
    customer_phone character varying,
    total_amount double precision,
    sold_by integer,
    sold_at timestamp without time zone
);


ALTER TABLE public.sales OWNER TO postgres;

--
-- Name: sales_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sales_id_seq OWNER TO postgres;

--
-- Name: sales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sales_id_seq OWNED BY public.sales.id;


--
-- Name: sales_invoice_no_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.sales ALTER COLUMN invoice_no ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.sales_invoice_no_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: stock_adjustments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_adjustments (
    id integer NOT NULL,
    product_id integer NOT NULL,
    inventory_id integer NOT NULL,
    quantity double precision NOT NULL,
    reason character varying NOT NULL,
    adjusted_by integer,
    adjusted_at timestamp without time zone
);


ALTER TABLE public.stock_adjustments OWNER TO postgres;

--
-- Name: stock_adjustments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.stock_adjustments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.stock_adjustments_id_seq OWNER TO postgres;

--
-- Name: stock_adjustments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.stock_adjustments_id_seq OWNED BY public.stock_adjustments.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50),
    hashed_password character varying NOT NULL,
    roles character varying(200)
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: vendors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vendors (
    id integer NOT NULL,
    business_name character varying NOT NULL,
    address character varying NOT NULL,
    phone_number character varying NOT NULL
);


ALTER TABLE public.vendors OWNER TO postgres;

--
-- Name: vendors_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vendors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.vendors_id_seq OWNER TO postgres;

--
-- Name: vendors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vendors_id_seq OWNED BY public.vendors.id;


--
-- Name: banks id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banks ALTER COLUMN id SET DEFAULT nextval('public.banks_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: expenses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses ALTER COLUMN id SET DEFAULT nextval('public.expenses_id_seq'::regclass);


--
-- Name: inventory id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory ALTER COLUMN id SET DEFAULT nextval('public.inventory_id_seq'::regclass);


--
-- Name: license_keys id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.license_keys ALTER COLUMN id SET DEFAULT nextval('public.license_keys_id_seq'::regclass);


--
-- Name: payments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments ALTER COLUMN id SET DEFAULT nextval('public.payments_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: purchases id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchases ALTER COLUMN id SET DEFAULT nextval('public.purchases_id_seq'::regclass);


--
-- Name: sale_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_items ALTER COLUMN id SET DEFAULT nextval('public.sale_items_id_seq'::regclass);


--
-- Name: sales id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales ALTER COLUMN id SET DEFAULT nextval('public.sales_id_seq'::regclass);


--
-- Name: stock_adjustments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_adjustments ALTER COLUMN id SET DEFAULT nextval('public.stock_adjustments_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: vendors id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendors ALTER COLUMN id SET DEFAULT nextval('public.vendors_id_seq'::regclass);


--
-- Data for Name: banks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.banks (id, name) FROM stdin;
1	FBN
2	UBA
3	GTB
4	ZENITH
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, name, description, created_at) FROM stdin;
1	Iphone	All Iphone	2026-01-24 21:32:40.787023+01
2	Tecno	All	2026-01-24 21:33:55.739182+01
3	Itel	All	2026-01-24 21:34:16.218528+01
4	Vivo	All	2026-01-24 21:34:40.191071+01
5	Samsung	All	2026-01-24 21:34:56.245533+01
6	Oppo	All	2026-01-24 21:35:24.293542+01
7	Nokia	All	2026-01-24 21:35:38.533852+01
8	Infinix	All	2026-01-24 21:35:50.085613+01
9	UK used Phone	All	2026-01-24 21:36:22.034942+01
10	Laptop	All	2026-01-24 21:36:47.077939+01
11	Kids Tab	All	2026-01-24 21:37:00.284465+01
12	Charger	All	2026-01-24 21:37:36.536212+01
14	Screen Guard	All	2026-01-24 21:40:01.08487+01
13	Flash Drive	All	2026-01-24 21:38:13.040732+01
16	Memory Card	All	2026-01-24 21:42:47.478232+01
17	Accessories	All	2026-01-24 21:43:41.663458+01
18	Smart Watch	All	2026-01-24 21:46:38.701505+01
19	Wifi/Router	All	2026-01-24 21:49:10.283415+01
15	Ear Pud /Headset	All	2026-01-24 21:40:49.708117+01
20	Pouch	All	2026-01-24 21:54:46.06725+01
21	Extension	All	2026-01-24 22:09:00.074898+01
22	Speaker	All	2026-01-24 22:41:32.281939+01
23	Power Bank	All	2026-01-25 10:50:41.693358+01
\.


--
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.expenses (id, ref_no, vendor_id, account_type, description, amount, payment_method, bank_id, expense_date, created_at, status, is_active, created_by) FROM stdin;
1	pcv101	2	Printing & Stationeries	purch of paper	4000	cash	\N	2026-01-26 13:29:00	2026-01-26 13:30:33.279259	paid	t	1
2	pcv214	2	Office Expenses	purch of plug	3000	transfer	2	2026-01-26 14:08:00	2026-01-26 14:09:03.57001	paid	t	1
4	pcv111	1	Vehicle Expenses	repairs	3000	transfer	2	2026-01-26 15:38:00	2026-01-26 15:38:53.580462	paid	t	1
\.


--
-- Data for Name: inventory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory (id, product_id, quantity_in, quantity_out, adjustment_total, current_stock, created_at, updated_at) FROM stdin;
3	7	0	1	0	-1	2026-01-24 21:44:05.62427	2026-01-24 21:44:05.627396
4	29	0	1	0	-1	2026-01-24 21:52:27.009988	2026-01-24 21:52:27.013078
5	13	0	1	0	-1	2026-01-24 23:13:49.448788	2026-01-24 23:13:49.467563
6	21	0	1	0	-1	2026-01-24 23:13:49.470574	2026-01-24 23:13:49.473593
11	63	0	1	0	-1	2026-01-25 10:58:12.819886	2026-01-25 10:58:12.825661
8	50	0	3	0	-3	2026-01-25 10:36:44.843688	2026-01-25 10:58:12.833762
12	85	0	1	0	-1	2026-01-25 10:58:12.826959	2026-01-25 10:58:12.83377
31	45	0	0	0	0	2026-02-04 00:01:49.095993	2026-02-04 00:03:54.133324
32	14	0	0	0	0	2026-02-04 00:01:49.114355	2026-02-04 00:03:54.133324
27	33	4	2	0	2	2026-01-26 23:23:45.350111	2026-02-04 07:24:28.55998
35	71	1	0	0	1	2026-02-04 07:24:28.616946	2026-02-04 07:24:28.616946
16	56	0	1	0	-1	2026-01-25 11:01:08.686083	2026-01-25 11:01:08.68842
17	80	10	0	0	10	2026-01-25 11:31:50.06778	2026-01-25 11:31:50.067787
36	12	0	1	0	-1	2026-02-04 07:27:48.595572	2026-02-04 07:27:48.600203
21	83	0	1	0	-1	2026-01-25 17:54:32.931924	2026-01-25 17:54:32.935641
15	55	0	2	0	-2	2026-01-25 11:01:08.679504	2026-01-26 12:08:48.722621
13	48	6	2	0	4	2026-01-25 11:01:08.655334	2026-02-04 14:00:23.287832
34	2	10	7	0	3	2026-02-04 07:24:28.585964	2026-02-04 14:01:16.087029
25	73	2	0	0	2	2026-01-26 14:26:38.921238	2026-01-26 14:26:38.921811
38	74	0	1	0	-1	2026-02-04 15:58:24.026847	2026-02-04 15:58:24.033845
14	53	0	5	0	-5	2026-01-25 11:01:08.673485	2026-01-27 09:22:33.495414
23	66	0	3	0	-3	2026-01-26 09:55:18.642706	2026-02-03 18:42:20.608493
26	69	0	2	0	-2	2026-01-26 21:00:55.085486	2026-02-03 18:42:20.608493
33	26	0	1	0	-1	2026-02-04 00:01:49.121369	2026-02-05 06:38:03.478632
28	78	0	1	0	-1	2026-02-03 18:42:20.613626	2026-02-03 18:42:20.621601
29	95	2	0	0	2	2026-02-03 19:35:38.605506	2026-02-03 19:35:38.605506
7	49	2	2	0	0	2026-01-25 10:36:44.815911	2026-02-03 22:18:17.188632
10	51	7	5	0	2	2026-01-25 10:55:06.850962	2026-02-03 22:30:42.908598
39	47	0	1	0	-1	2026-02-05 06:38:03.480612	2026-02-05 06:38:03.485873
37	31	0	2	0	-2	2026-02-04 15:58:24.000861	2026-02-05 06:47:01.461693
24	67	0	3	0	-3	2026-01-26 09:55:18.657515	2026-02-05 06:47:01.471146
40	36	0	1	0	-1	2026-02-05 06:47:01.462692	2026-02-05 06:47:01.471146
9	52	0	5	0	-5	2026-01-25 10:36:44.849778	2026-02-05 06:51:22.189279
18	30	0	3	0	-3	2026-01-25 17:52:43.846186	2026-02-05 06:51:22.189279
19	32	0	3	0	-3	2026-01-25 17:52:43.869954	2026-02-05 06:51:22.189279
20	35	0	3	0	-3	2026-01-25 17:52:43.881612	2026-02-05 06:51:22.189279
22	57	0	2	0	-2	2026-01-26 07:12:10.323114	2026-02-05 06:51:22.189279
30	1	5	3	1	3	2026-02-03 21:41:41.191558	2026-02-05 23:08:20.769908
1	5	4	2	1	3	2026-01-24 21:44:05.583184	2026-02-05 23:25:18.70132
2	6	0	1	2	1	2026-01-24 21:44:05.617973	2026-02-05 23:39:01.701885
\.


--
-- Data for Name: license_keys; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.license_keys (id, key, is_active, created_at, expiration_date) FROM stdin;
2	222	t	2026-01-24 15:18:20.259771	2027-01-24 15:18:20.245359
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, sale_invoice_no, amount_paid, discount_allowed, payment_method, bank_id, reference_no, balance_due, status, payment_date, created_by, created_at) FROM stdin;
1	1	29000	0	cash	\N	76be6d83-45ac-43c2-8456-4aaca26c9efa	0	completed	2026-01-24 22:44:05.651992	1	2026-01-24 21:44:05.664077
2	3	37000	0	cash	\N	3bdfea13-70b1-4460-9514-d68a1c595506	0	completed	2026-01-25 00:13:49.50687	1	2026-01-24 23:13:49.520411
3	4	450000	0	transfer	1	841c7a9f-82d3-4b25-9e5b-fa81725ea91a	0	completed	2026-01-25 11:36:44.876977	1	2026-01-25 10:36:44.889163
4	5	300000	0	cash	\N	317adc63-5c41-4f6a-b84f-e2f90bc0bf79	0	completed	2026-01-25 11:55:06.879548	1	2026-01-25 10:55:06.895224
5	6	1050000	0	transfer	1	d127cf1f-f4d9-407c-8c57-b3dc941fe733	0	completed	2026-01-25 11:58:12.853307	1	2026-01-25 10:58:12.858801
6	7	1020000	0	transfer	1	afc1905c-cb9e-4767-9405-2b93bbd562f4	0	completed	2026-01-25 12:01:08.705459	1	2026-01-25 11:01:08.708472
7	8	26500	0	transfer	1	42b93b8f-c19d-4e83-b29b-2616774ce643	0	completed	2026-01-25 18:52:43.916896	1	2026-01-25 17:52:43.937328
8	9	450000	0	cash	\N	7128b9d4-8720-4e8c-9a26-d8cb8ac137c5	0	completed	2026-01-25 18:54:32.953905	1	2026-01-25 17:54:32.956854
9	2	15000	0	transfer	3	b6b057b7-0b04-440c-a146-83c642a50f0f	0	completed	2026-01-25 00:00:00	1	2026-01-25 23:33:59.06779
10	10	450000	0	cash	\N	3deed790-e680-41f8-968d-f14f536476ac	0	completed	2026-01-26 08:12:10.356223	1	2026-01-26 07:12:10.367829
11	11	900000	0	cash	\N	7563a5e7-767d-47e9-a02f-71887f10bf82	0	completed	2026-01-26 10:55:18.68398	1	2026-01-26 09:55:18.696917
12	12	450000	0	cash	\N	7cbff02d-ec0c-4cd4-a07c-a6398f768db7	0	completed	2026-01-26 13:08:48.752763	1	2026-01-26 12:08:48.765832
13	13	300000	0	cash	\N	f3d0a435-d1a9-4fac-bfaa-7addaba1ac26	0	completed	2026-01-26 14:23:08.342615	1	2026-01-26 13:23:08.356845
14	14	900000	0	cash	\N	693762f4-7fad-4eb2-a389-1c0ba06dce1a	0	completed	2026-01-26 22:00:55.111593	1	2026-01-26 21:00:55.124824
15	15	8000	0	cash	\N	d4c54da4-a952-4402-8d33-44de83db2b9f	0	completed	2026-01-26 22:18:47.866099	1	2026-01-26 21:18:47.878236
16	16	17000	0	cash	\N	4b218d0f-0078-4d75-ab59-d3a8f86d3d20	0	completed	2026-01-27 00:23:45.379589	1	2026-01-26 23:23:45.38507
17	17	19000	0	cash	\N	4bec274d-c90a-4691-a903-063e4e80836c	500	part_paid	2026-01-27 01:19:17.489048	1	2026-01-27 00:19:17.494734
18	18	450000	0	cash	\N	2b53f2a3-1e8e-4a4a-8710-b4d616d2a49c	0	completed	2026-01-27 03:29:04.996802	1	2026-01-27 02:29:05.003438
19	19	280000	0	cash	\N	81e5156e-8adc-439f-a8b4-097f8b753dec	0	completed	2026-01-27 10:22:33.518445	1	2026-01-27 09:22:33.5265
20	20	1490000	0	cash	\N	f6936194-6a3a-495d-8fe9-737590814a20	0	completed	2026-02-03 19:42:20.648941	1	2026-02-03 18:42:20.65494
22	22	12000	0	cash	\N	916d800c-4adc-494a-b1c2-6036e19bfe15	0	completed	2026-02-04 08:27:48.633771	1	2026-02-04 07:27:48.646962
23	25	10000	0	transfer	2	cf5cb0aa-14a6-4814-88ca-810c45397929	0	completed	2026-02-04 14:54:49.557398	1	2026-02-04 13:54:49.569465
24	26	6000	0	cash	\N	def2624b-e1af-46e5-8e83-0321a8d29c2f	0	completed	2026-02-04 14:56:23.908616	1	2026-02-04 13:56:23.916651
25	27	0	0	cash	\N	55464b46-1a53-43cf-9186-3572e0aea02a	3000	pending	2026-02-04 14:56:59.005898	1	2026-02-04 13:56:59.008681
26	28	17000	0	cash	\N	909e2f58-9648-437c-a227-6b07ae27ac9b	0	completed	2026-02-04 14:58:27.30889	1	2026-02-04 13:58:27.311594
27	29	150000	0	cash	\N	233a7da2-e520-41e4-9999-00354add15ae	0	completed	2026-02-04 15:00:23.307067	1	2026-02-04 14:00:23.309541
28	30	3000	0	cash	\N	03c483cc-68c5-4798-99b2-bfc354fae2f9	0	completed	2026-02-04 15:01:16.102502	1	2026-02-04 14:01:16.11051
29	31	458000	0	cash	\N	64e7b30f-b28b-4ad1-9bb4-45df6fee82f4	0	completed	2026-02-04 16:58:24.076817	1	2026-02-04 15:58:24.101805
30	23	10000	0	cash	\N	4911e0be-cd05-45dd-97ef-3a5be95e2c56	0	completed	2026-02-04 00:00:00	1	2026-02-04 22:03:52.837975
31	24	10000	0	cash	\N	8352ed2f-58e1-481a-b854-77fdc4854411	0	completed	2026-02-04 00:00:00	1	2026-02-04 22:03:59.626513
32	32	0	0	cash	\N	715f6ccd-8bb2-4c55-9a48-05795599b0e6	157000	pending	2026-02-05 07:38:03.51342	1	2026-02-05 06:38:03.5238
33	33	469000	0	cash	\N	dec55ea2-5af1-4481-b2bf-8e05c315cede	0	completed	2026-02-05 07:47:01.496903	1	2026-02-05 06:47:01.499925
34	34	326500	0	cash	\N	65ac9ead-76c8-4517-8223-5e97fdfcd450	0	completed	2026-02-05 07:51:22.213026	1	2026-02-05 06:51:22.216024
35	27	3000	0	transfer	2	b0224685-3271-4dc6-b211-ece80bb35a44	0	completed	2026-02-05 00:00:00	1	2026-02-05 06:52:54.89906
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, name, category_id, type, cost_price, selling_price, is_active, created_at) FROM stdin;
3	GORRELA SCREEN GUARD	14	Accessory	1500	3000	t	2026-01-24 21:23:53.846899
4	5G SMART WATCH	18	Watch	15000	20000	t	2026-01-24 21:23:53.846903
6	AIR PUD	15	Accessory	3500	6000	t	2026-01-24 21:23:53.84691
7	AIRPOD PRO	15	Accessory	3500	6000	t	2026-01-24 21:23:53.846914
8	AIRTEL 4G SMARTBOX R	19	Router	6000	10000	t	2026-01-24 21:23:53.846917
9	AIRTEL ROUTER	19	Router	5000	9000	t	2026-01-24 21:23:53.846921
10	ANDRIOD CHARGER	12	Android	4500	7000	t	2026-01-24 21:23:53.846924
11	ANDRIOD POUCH	20	Android	1500	3000	t	2026-01-24 21:23:53.846927
12	ANDRIOD SCREEN GUARD	14	Screen Guard	1500	3000	t	2026-01-24 21:23:53.846931
13	APPLE WATCH	18	Watch	15000	20000	t	2026-01-24 21:23:53.846934
14	BOLT ROUTER	19	Router	6000	10000	t	2026-01-24 21:23:53.846937
15	BOLT ROUTER-BIG	19	Router	7000	10000	t	2026-01-24 21:23:53.846941
16	BOLT WIFI	19	Router	6000	10000	t	2026-01-24 21:23:53.846944
17	C 2LM- CHARGER	12	Accessory	4000	7000	t	2026-01-24 21:23:53.846947
18	C22 ORIAMO CABLE	12	Oriamo	8000	12000	t	2026-01-24 21:23:53.84695
19	SAMSUNG CHARGER 3.M DATA CABLE	12	Samsung	5000	8000	t	2026-01-24 21:23:53.846954
20	CHUPEZ EXTENSION SOC	21	Chupez	6000	9000	t	2026-01-24 21:23:53.846957
21	D200 ULTRA 2 WIRELESS WATCH	18	Watch	12000	17000	t	2026-01-24 21:23:53.84696
22	D96 PLUS SMART WATCH	18	Watch	12000	17000	t	2026-01-24 21:23:53.846963
23	DELL LATITUDE 3310 2 IN 1 LAPT	10	Laptop	300000	350000	t	2026-01-24 21:23:53.846966
24	DOUBLE CHARGER ANDRIOD	12	Android	4500	8000	t	2026-01-24 21:23:53.84697
25	DOUBLE CHARGER TYPE C	12	Double	10000	15000	t	2026-01-24 21:23:53.846973
26	EAR - POD	15	Ear	5000	7000	t	2026-01-24 21:23:53.846977
27	BACK GLASS	17	Accessory	4000	6000	t	2026-01-24 21:37:45.585209
28	CAMERA GLASS	17	Accessory	5000	7000	t	2026-01-24 21:37:45.585224
29	1ST EAGLE EXTENSION	21	Accessory	10000	15000	t	2026-01-24 21:37:45.585228
30	CHUPEZ FLASH DRIVER	13	Chupez	5000	8000	t	2026-01-24 21:37:45.585231
31	CHUPEZ SD CARDS	13	Chupez	5000	8000	t	2026-01-24 21:37:45.585235
32	FLASH DRIVER	13	Flash Drive	5000	8000	t	2026-01-24 21:37:45.585238
34	FLASH DRIVER-16G	13	Flash Drive	5000	10000	t	2026-01-24 21:37:45.585245
35	FLASH DRIVER-2G	13	Flash Drive	5000	10500	t	2026-01-24 21:37:45.585248
36	FLASH DRIVER-32G	13	Flash Drive	5000	11000	t	2026-01-24 21:37:45.585251
37	FLASH DRIVER-4G	13	Flash Drive	5000	8000	t	2026-01-24 21:37:45.585254
38	FLASH DRIVER-64G	13	Flash Drive	10000	15000	t	2026-01-24 21:37:45.585258
39	FLASH DRIVER-8G	13	Flash Drive	5000	8000	t	2026-01-24 21:37:45.585261
40	BOOM BOX X3	22	Speaker	150000	250000	t	2026-01-24 21:43:32.087073
43	Infinix  X-PAD 4G(8 +)	8	Phone	120000	150000	t	2026-01-24 22:33:51.667306
50	INFINIX-HOT 50 PRO+ (8+128GB)	8	Phone	120000	150000	t	2026-01-24 22:33:51.667331
52	INFINIX-HOT 50i (4+256GB)	8	Phone	120000	150000	t	2026-01-24 22:33:51.667338
53	INFINIX-HOT 50 PRO+ (8+256GB)	8	Phone	120000	150000	t	2026-01-24 22:33:51.667342
55	INFINIX-NOTE 40 PRO (8+256GB)	8	Phone	120000	150000	t	2026-01-24 22:33:51.66735
56	INFINIX-NOTE 50 (8+256GB)	8	Phone	120000	150000	t	2026-01-24 22:33:51.667353
57	INFINIX-SMART 8 (2+64GB)	8	Phone	120000	150000	t	2026-01-24 22:33:51.667357
58	INFINIX-SMART 9 (3+128GB)	8	Phone	120000	150000	t	2026-01-24 22:33:51.667361
59	INFINIX-SMART 9HD (3+64GB)	8	Phone	120000	150000	t	2026-01-24 22:33:51.667364
60	IPHONE BLUETOOTH EAR PIECE	15	Iphone	6000	8000	t	2026-01-24 22:33:51.667368
61	IPONE DIRECT EARPIECE	15	Iphone	6000	8000	t	2026-01-24 22:33:51.667371
63	IPHONE X 64GB	1	Phone	320000	450000	t	2026-01-24 22:33:51.667379
65	IPHONE XR UK USED 64GB	9	Phone	320000	450000	t	2026-01-24 22:33:51.667386
66	IPHONE XSMAX 256GB	1	Phone	320000	450000	t	2026-01-24 22:33:51.667394
67	IPHONE XSMAX 64GB	1	Phone	320000	450000	t	2026-01-24 22:33:51.667397
69	IPHONE11  128GB	1	Phone	320000	450000	t	2026-01-24 22:33:51.667405
72	IPHONE11 PRO MAX 256GB	1	Phone	320000	450000	t	2026-01-24 22:33:51.667415
74	IPHONE12  128GB	1	Phone	320000	450000	t	2026-01-24 22:33:51.667423
78	IPHONE 12 PRO 128GB	1	Phone	320000	450000	t	2026-01-24 22:33:51.667437
81	IPHONE 12 PRO MAX 128GB	1	Phone	320000	450000	t	2026-01-24 22:33:51.667448
76	IPHONE 12 PRO MAX 256GB-UK USE	9	Phone	320000	450000	t	2026-01-24 22:33:51.66743
70	IPHONE11 64GB UK USE	9	Phone	320000	450000	t	2026-01-24 22:33:51.667408
64	IPHONE XR UK USED 128GB	9	Phone	320000	450000	t	2026-01-24 22:33:51.667382
68	IPHONE XSMAX 64GB UK USE	9	Phone	320000	450000	t	2026-01-24 22:33:51.667401
75	IPHONE 12 PRO MAX 128-UK USE	9	Phone	320000	450000	t	2026-01-24 22:33:51.667426
77	IP12 PRO 128GB-UK USE	9	Phone	320000	450000	t	2026-01-24 22:33:51.667433
54	INFINIX CHARGER	12	Phone	120000	150000	t	2026-01-24 22:33:51.667346
47	Infinix XW30 TWS EAR	15	Phone	120000	150000	t	2026-01-24 22:33:51.66732
46	Infinix XW3 SMART WA	18	Phone	120000	150000	t	2026-01-24 22:33:51.667317
44	Infinix XE29 TWS EAR	15	Phone	120000	150000	t	2026-01-24 22:33:51.667309
45	Infinix XP10 POWER BANK	23	Phone	120000	150000	t	2026-01-24 22:33:51.667313
41	Infinix-XW3E SMART WATCH	18	Phone	120000	150000	t	2026-01-24 22:33:51.667293
80	IPHONE 12 PRO 256GB	1	Phone	340000	450000	t	2026-01-24 22:33:51.667444
5	AIR MAX HEAD SET	15	Accessory	10000	17000	t	2026-01-24 21:23:53.846907
62	IPHONE X 256GB	1	Phone	320000	450000	t	2026-01-24 22:33:51.667375
73	IPHONE 11 PRO MAX 64GB	1	Phone	400000	450000	t	2026-01-24 22:33:51.667419
48	INFINIX-HOT 40 PRO (8+256GB)	8	Phone	230000	150000	t	2026-01-24 22:33:51.667324
1	21D CAR CHARGER	12	Android	7000	10000	t	2026-01-24 21:23:53.846888
49	INFINIX-HOT 50 (8+256GB)	8	Phone	220000	150000	t	2026-01-24 22:33:51.667327
51	INFINIX-HOT 50i (4+128GB)	8	Phone	250000	150000	t	2026-01-24 22:33:51.667335
33	FLASH DRIVER-128G	13	Flash Drive	7000	9000	t	2026-01-24 21:37:45.585242
2	21D SCREEN GUARD	14	Screen Guard	2500	3000	t	2026-01-24 21:23:53.846895
71	IPHONE 11 PRO MAX 648GB-UK USE	9	Phone	180000	500000	t	2026-01-24 22:33:51.667412
82	IPHONE 12 PRO MAX 256GB	1	Phone	320000	450000	t	2026-01-24 22:33:51.667451
83	IPHONE 12 PRO MAX 512GB	1	Phone	320000	450000	t	2026-01-24 22:33:51.667455
84	IPHONE 13 (512GB)	1	Phone	320000	450000	t	2026-01-24 22:33:51.667459
85	IPHONE13 128GB	1	Phone	320000	450000	t	2026-01-24 22:33:51.667462
89	IPHONE13 PRO 128GB	1	Phone	320000	450000	t	2026-01-24 22:33:51.667476
90	IPHONE 13 PRO 256GB	1	Phone	320000	450000	t	2026-01-24 22:33:51.66748
91	IPHONE 13 PRO MAX 128GB	1	Phone	320000	450000	t	2026-01-24 22:33:51.667483
92	IPHONE 13 PRO MAX 256GB	1	Phone	320000	450000	t	2026-01-24 22:33:51.667487
93	IPHONE14  128GB	1	Phone	320000	450000	t	2026-01-24 22:33:51.667491
94	IPHONE 14 PLUS 256GB	1	Phone	320000	450000	t	2026-01-24 22:33:51.667494
97	IPHONE 14 PRO 256GB	1	Phone	320000	450000	t	2026-01-24 22:33:51.667505
98	IPHONE 14 PRO MAX 128GB	1	Phone	320000	450000	t	2026-01-24 22:33:51.667508
99	IPHONE 14 PRO MAX 256GB	1	Phone	320000	450000	t	2026-01-24 22:33:51.667512
100	IPHONE 15 128GB	1	Phone	320000	450000	t	2026-01-24 22:33:51.667516
102	IPHONE 15 PRO 128GB	1	Phone	320000	450000	t	2026-01-24 22:33:51.667523
103	IPHONE 15 PRO MAX 256GB	1	Phone	320000	450000	t	2026-01-24 22:33:51.667526
104	IPHONE15 PRO MAX 512GB	1	Phone	320000	450000	t	2026-01-24 22:33:51.66753
106	IPHONE 16  128GB	1	Phone	320000	450000	t	2026-01-24 22:33:51.667537
107	IPHONE 16 256GB Redg	1	Phone	320000	450000	t	2026-01-24 22:33:51.66754
108	IPHONE 16+ 128GB	1	Phone	320000	450000	t	2026-01-24 22:33:51.667544
109	IPHONE 16 PLUS 512GB	1	Phone	320000	450000	t	2026-01-24 22:33:51.667547
110	IPHONE 16 PRO 128GB	1	Phone	320000	450000	t	2026-01-24 22:33:51.667551
111	IPHONE 16 PRO MAX 256GB	1	Phone	320000	450000	t	2026-01-24 22:33:51.667555
112	IPHONE 16 PRO MAX 512GB	1	Phone	320000	450000	t	2026-01-24 22:33:51.667558
101	IPHONE 15 PRO MAX 256GB UK USE	9	Phone	320000	450000	t	2026-01-24 22:33:51.667519
96	IPHONE 14 PRO 128GB UK USE	9	Phone	320000	450000	t	2026-01-24 22:33:51.667501
87	IPHONE 13 CHARGER	12	Phone	320000	450000	t	2026-01-24 22:33:51.667469
86	IPHONE 13 128GB UK USE	9	Phone	320000	450000	t	2026-01-24 22:33:51.667466
79	IPHONE 12 PRO 256GB-UK USE	9	Phone	320000	450000	t	2026-01-24 22:33:51.667441
88	IPHONE 13PRO MAX 128GB-UK USE	9	Phone	320000	450000	t	2026-01-24 22:33:51.667473
105	IPHONE 15 PROMAX CHARGER	12	Phone	320000	450000	t	2026-01-24 22:33:51.667533
42	Infinix-XW3P SMART WATCH	18	Phone	120000	150000	t	2026-01-24 22:33:51.667301
95	IPHONE 14 PRO 128GB	1	Phone	330000	450000	t	2026-01-24 22:33:51.667498
\.


--
-- Data for Name: purchases; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchases (id, product_id, vendor_id, quantity, cost_price, total_cost, purchase_date, invoice_no) FROM stdin;
1	80	1	10	340000	3400000	2026-01-25 11:31:50.064007	PUR-1
2	48	1	5	300000	1500000	2026-01-25 11:31:50.083805	PUR-2
3	73	1	2	400000	800000	2026-01-26 14:26:38.911506	PUR-3
4	48	2	1	230000	230000	2026-02-03 19:35:38.58145	PUR-4
5	95	2	2	330000	660000	2026-02-03 19:35:38.603507	PUR-5
6	5	2	4	10000	40000	2026-02-03 19:35:38.619675	PUR-6
8	1	1	5	7000	35000	2026-02-03 21:41:41.173593	22311
9	49	1	2	220000	440000	2026-02-03 22:18:17.182595	334
10	51	2	7	250000	1750000	2026-02-03 22:30:42.905684	888
11	33	2	4	7000	28000	2026-02-04 07:24:28.529016	005
12	2	2	10	2500	25000	2026-02-04 07:24:28.582965	005
13	71	2	1	180000	180000	2026-02-04 07:24:28.615947	005
\.


--
-- Data for Name: sale_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sale_items (id, sale_invoice_no, product_id, quantity, selling_price, total_amount, gross_amount, discount, net_amount) FROM stdin;
1	1	5	1	17000	17000	17000	0	17000
2	1	6	1	6000	6000	6000	0	6000
3	1	7	1	6000	6000	6000	0	6000
4	2	29	1	15000	15000	15000	0	15000
5	3	13	1	20000	20000	20000	0	20000
6	3	21	1	17000	17000	17000	0	17000
7	4	49	1	150000	150000	150000	0	150000
8	4	50	1	150000	150000	150000	0	150000
9	4	52	1	150000	150000	150000	0	150000
10	5	50	1	150000	150000	150000	0	150000
11	5	51	1	150000	150000	150000	0	150000
12	6	63	1	450000	450000	450000	0	450000
13	6	85	1	450000	450000	450000	0	450000
14	6	50	1	150000	150000	150000	0	150000
15	7	49	1	150000	120000	150000	30000	120000
17	7	51	1	150000	150000	150000	0	150000
18	7	52	1	150000	150000	150000	0	150000
19	7	53	1	150000	150000	150000	0	150000
20	7	55	1	150000	150000	150000	0	150000
21	7	56	1	150000	150000	150000	0	150000
22	8	30	1	8000	8000	8000	0	8000
23	8	32	1	8000	8000	8000	0	8000
24	8	35	1	10500	10500	10500	0	10500
25	9	83	1	450000	450000	450000	0	450000
16	7	48	1	350000	350000	350000	0	350000
26	10	52	1	150000	150000	150000	0	150000
27	10	53	1	150000	150000	150000	0	150000
28	10	57	1	150000	150000	150000	0	150000
29	11	66	1	450000	450000	450000	0	450000
30	11	67	1	450000	450000	450000	0	450000
31	12	52	1	150000	150000	150000	0	150000
32	12	53	1	150000	150000	150000	0	150000
33	12	55	1	150000	150000	150000	0	150000
34	13	53	1	150000	150000	150000	0	150000
35	13	51	1	150000	150000	150000	0	150000
36	14	67	1	450000	450000	450000	0	450000
37	14	69	1	450000	450000	450000	0	450000
38	15	30	1	8000	8000	8000	0	8000
39	16	33	1	9000	9000	9000	0	9000
40	16	32	1	8000	8000	8000	0	8000
41	17	33	1	9000	9000	9000	0	9000
42	17	35	1	10500	10500	10500	0	10500
43	18	66	1	450000	450000	450000	0	450000
44	19	51	1	150000	130000	150000	20000	130000
45	19	53	1	150000	150000	150000	0	150000
46	20	66	1	450000	440000	450000	10000	440000
47	20	69	1	450000	450000	450000	0	450000
48	20	78	1	450000	450000	450000	0	450000
49	20	51	1	150000	150000	150000	0	150000
53	22	2	3	3000	9000	9000	0	9000
54	22	12	1	3000	3000	3000	0	3000
55	23	1	1	10000	10000	10000	0	10000
56	24	1	1	10000	10000	10000	0	10000
57	25	1	1	10000	10000	10000	0	10000
58	26	2	2	3000	6000	6000	0	6000
59	27	2	1	3000	3000	3000	0	3000
60	28	5	1	17000	17000	17000	0	17000
61	29	48	1	150000	150000	150000	0	150000
62	30	2	1	3000	3000	3000	0	3000
63	31	31	1	8000	8000	8000	0	8000
64	31	74	1	450000	450000	450000	0	450000
65	32	26	1	7000	7000	7000	0	7000
66	32	47	1	150000	150000	150000	0	150000
67	33	31	1	8000	8000	8000	0	8000
68	33	36	1	11000	11000	11000	0	11000
69	33	67	1	450000	450000	450000	0	450000
70	34	30	1	8000	8000	8000	0	8000
71	34	32	1	8000	8000	8000	0	8000
72	34	35	1	10500	10500	10500	0	10500
73	34	52	1	150000	150000	150000	0	150000
74	34	57	1	150000	150000	150000	0	150000
\.


--
-- Data for Name: sales; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sales (id, invoice_no, invoice_date, ref_no, customer_name, customer_phone, total_amount, sold_by, sold_at) FROM stdin;
1	1	2026-01-24 00:00:00	\N	Walk-in	\N	29000	1	2026-01-24 21:44:05.539213
2	2	2026-01-24 00:00:00	\N		\N	15000	1	2026-01-24 21:52:27.000525
3	3	2026-01-24 00:00:00	\N	Pat	\N	37000	1	2026-01-24 23:13:49.420633
4	4	2026-01-25 00:00:00	\N	Walk-in	\N	450000	1	2026-01-25 10:36:44.775715
5	5	2026-01-25 00:00:00	\N	Walk-in	\N	300000	1	2026-01-25 10:55:06.809008
6	6	2026-01-25 00:00:00	\N	Walk-in	\N	1050000	1	2026-01-25 10:58:12.810305
8	8	2026-01-25 00:00:00	\N	Walk-in	\N	26500	1	2026-01-25 17:52:43.812857
9	9	2026-01-25 00:00:00	\N	Walk-in	\N	450000	1	2026-01-25 17:54:32.921693
7	7	2026-01-25 00:00:00	\N	Walk-in	\N	1220000	1	2026-01-25 11:01:08.637337
10	10	2026-01-26 00:00:00	\N	Walk-in	\N	450000	1	2026-01-26 07:12:10.272652
11	11	2026-01-26 00:00:00	\N	Walk-in	\N	900000	1	2026-01-26 09:55:18.617306
12	12	2026-01-26 00:00:00	\N	Walk-in	\N	450000	1	2026-01-26 12:08:48.682643
13	13	2026-01-26 00:00:00	\N	Walk-in	\N	300000	1	2026-01-26 13:23:08.270653
14	14	2026-01-26 00:00:00	\N	Walk-in	\N	900000	1	2026-01-26 21:00:55.037652
15	15	2026-01-26 00:00:00	\N	Walk-in	\N	8000	1	2026-01-26 21:18:47.817597
16	16	2026-01-26 00:00:00	\N	Walk-in	\N	17000	1	2026-01-26 23:23:45.323713
17	17	2026-01-27 00:00:00	\N	Walk-in	\N	19500	1	2026-01-27 00:19:17.442046
18	18	2026-01-27 00:00:00	\N	Walk-in	\N	450000	1	2026-01-27 02:29:04.955574
19	19	2026-01-27 00:00:00	\N	Walk-in	\N	280000	1	2026-01-27 09:22:33.46016
20	20	2026-02-03 00:00:00	\N	Walk-in	\N	1490000	1	2026-02-03 18:42:20.555959
22	22	2026-02-04 00:00:00	\N	Walk-in	\N	12000	1	2026-02-04 07:27:48.570427
23	23	2026-02-04 00:00:00	\N		\N	10000	1	2026-02-04 07:29:30.946055
24	24	2026-02-04 00:00:00	\N		\N	10000	1	2026-02-04 13:54:37.0236
25	25	2026-02-04 00:00:00	\N		\N	10000	1	2026-02-04 13:54:49.531757
26	26	2026-02-04 00:00:00	\N	Walk-in	\N	6000	1	2026-02-04 13:56:23.878168
27	27	2026-02-04 00:00:00	\N	Walk-in	\N	3000	1	2026-02-04 13:56:58.982616
28	28	2026-02-04 00:00:00	\N		\N	17000	1	2026-02-04 13:58:27.285546
29	29	2026-02-04 00:00:00	\N		\N	150000	1	2026-02-04 14:00:23.277493
30	30	2026-02-04 00:00:00	\N		\N	3000	1	2026-02-04 14:01:16.078534
31	31	2026-02-04 00:00:00	\N	Walk-in	\N	458000	1	2026-02-04 15:58:23.95589
32	32	2026-02-05 00:00:00	\N	Oke	\N	157000	1	2026-02-05 06:38:03.450815
33	33	2026-02-05 00:00:00	\N	Walk-in	\N	469000	1	2026-02-05 06:47:01.448233
34	34	2026-02-05 00:00:00	\N	Walk-in	\N	326500	1	2026-02-05 06:51:22.157316
\.


--
-- Data for Name: stock_adjustments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_adjustments (id, product_id, inventory_id, quantity, reason, adjusted_by, adjusted_at) FROM stdin;
1	5	1	-1	bad	1	2026-02-05 07:21:31.013992
2	5	1	2	bad	1	2026-02-05 07:21:50.13618
3	5	1	-1	bad	1	2026-02-05 21:45:50.533095
4	1	30	-1	bad	1	2026-02-05 21:50:10.18018
5	1	30	-1	bad	1	2026-02-05 22:06:20.822751
6	1	30	1	bad	1	2026-02-05 22:41:42.508021
7	1	30	1	bad	1	2026-02-05 23:02:31.227133
8	1	30	1	bad	1	2026-02-05 23:08:20.788143
9	5	1	-1	bad	1	2026-02-05 23:21:41.277866
10	5	1	2	add	1	2026-02-05 23:25:18.704514
11	6	2	2	bad	1	2026-02-05 23:39:01.704922
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, hashed_password, roles) FROM stdin;
1	fcn	$2b$12$Mct/IH7.pTJ7NHeL4JrZ9OWUfrbtwHrtVLbJGNxTMeFBPizUEXuba	admin
2	dan	$2b$12$s79bSkQourFYn0igUHzjEu6xURWrS.N8DHYIMYrq4qbo.V1xL0O2i	user
3	pat	$2b$12$5hALrVmzLzoPtLSExzxR3e3GLu1eag1pj0rFmukGtSUzB5XOSY7xm	manager
\.


--
-- Data for Name: vendors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vendors (id, business_name, address, phone_number) FROM stdin;
1	XYZ	Sapele	08103810431
2	PFN	2 Okpe Rd	08061203086
\.


--
-- Name: banks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.banks_id_seq', 4, true);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categories_id_seq', 23, true);


--
-- Name: expenses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.expenses_id_seq', 4, true);


--
-- Name: inventory_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.inventory_id_seq', 40, true);


--
-- Name: license_keys_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.license_keys_id_seq', 2, true);


--
-- Name: payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payments_id_seq', 35, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.products_id_seq', 112, true);


--
-- Name: purchases_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.purchases_id_seq', 13, true);


--
-- Name: sale_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sale_items_id_seq', 74, true);


--
-- Name: sales_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sales_id_seq', 34, true);


--
-- Name: sales_invoice_no_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sales_invoice_no_seq', 34, true);


--
-- Name: stock_adjustments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.stock_adjustments_id_seq', 11, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 3, true);


--
-- Name: vendors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.vendors_id_seq', 2, true);


--
-- Name: banks banks_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banks
    ADD CONSTRAINT banks_name_key UNIQUE (name);


--
-- Name: banks banks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banks
    ADD CONSTRAINT banks_pkey PRIMARY KEY (id);


--
-- Name: categories categories_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key UNIQUE (name);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: expenses expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);


--
-- Name: inventory inventory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_pkey PRIMARY KEY (id);


--
-- Name: license_keys license_keys_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.license_keys
    ADD CONSTRAINT license_keys_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: purchases purchases_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchases_pkey PRIMARY KEY (id);


--
-- Name: sale_items sale_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT sale_items_pkey PRIMARY KEY (id);


--
-- Name: sales sales_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_pkey PRIMARY KEY (id);


--
-- Name: stock_adjustments stock_adjustments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_adjustments
    ADD CONSTRAINT stock_adjustments_pkey PRIMARY KEY (id);


--
-- Name: products uq_product_name_category; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT uq_product_name_category UNIQUE (name, category_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: vendors vendors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_pkey PRIMARY KEY (id);


--
-- Name: ix_banks_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_banks_id ON public.banks USING btree (id);


--
-- Name: ix_categories_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_categories_id ON public.categories USING btree (id);


--
-- Name: ix_expenses_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_expenses_id ON public.expenses USING btree (id);


--
-- Name: ix_expenses_ref_no; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_expenses_ref_no ON public.expenses USING btree (ref_no);


--
-- Name: ix_inventory_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_inventory_id ON public.inventory USING btree (id);


--
-- Name: ix_license_keys_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_license_keys_id ON public.license_keys USING btree (id);


--
-- Name: ix_license_keys_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_license_keys_key ON public.license_keys USING btree (key);


--
-- Name: ix_payments_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_payments_id ON public.payments USING btree (id);


--
-- Name: ix_products_category_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_products_category_id ON public.products USING btree (category_id);


--
-- Name: ix_products_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_products_id ON public.products USING btree (id);


--
-- Name: ix_products_is_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_products_is_active ON public.products USING btree (is_active);


--
-- Name: ix_purchases_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_purchases_id ON public.purchases USING btree (id);


--
-- Name: ix_sale_items_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_sale_items_id ON public.sale_items USING btree (id);


--
-- Name: ix_sale_items_sale_invoice_no; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_sale_items_sale_invoice_no ON public.sale_items USING btree (sale_invoice_no);


--
-- Name: ix_sales_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_sales_id ON public.sales USING btree (id);


--
-- Name: ix_sales_invoice_no; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_sales_invoice_no ON public.sales USING btree (invoice_no);


--
-- Name: ix_stock_adjustments_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_stock_adjustments_id ON public.stock_adjustments USING btree (id);


--
-- Name: ix_vendors_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_vendors_id ON public.vendors USING btree (id);


--
-- Name: expenses expenses_bank_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_bank_id_fkey FOREIGN KEY (bank_id) REFERENCES public.banks(id) ON DELETE SET NULL;


--
-- Name: expenses expenses_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: expenses expenses_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id);


--
-- Name: inventory inventory_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: payments payments_bank_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_bank_id_fkey FOREIGN KEY (bank_id) REFERENCES public.banks(id) ON DELETE SET NULL;


--
-- Name: payments payments_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: payments payments_sale_invoice_no_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_sale_invoice_no_fkey FOREIGN KEY (sale_invoice_no) REFERENCES public.sales(invoice_no) ON DELETE CASCADE;


--
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE RESTRICT;


--
-- Name: purchases purchases_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchases_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: purchases purchases_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchases_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE SET NULL;


--
-- Name: sale_items sale_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT sale_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL;


--
-- Name: sale_items sale_items_sale_invoice_no_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT sale_items_sale_invoice_no_fkey FOREIGN KEY (sale_invoice_no) REFERENCES public.sales(invoice_no) ON DELETE CASCADE;


--
-- Name: sales sales_sold_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_sold_by_fkey FOREIGN KEY (sold_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: stock_adjustments stock_adjustments_adjusted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_adjustments
    ADD CONSTRAINT stock_adjustments_adjusted_by_fkey FOREIGN KEY (adjusted_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: stock_adjustments stock_adjustments_inventory_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_adjustments
    ADD CONSTRAINT stock_adjustments_inventory_id_fkey FOREIGN KEY (inventory_id) REFERENCES public.inventory(id) ON DELETE CASCADE;


--
-- Name: stock_adjustments stock_adjustments_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_adjustments
    ADD CONSTRAINT stock_adjustments_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

